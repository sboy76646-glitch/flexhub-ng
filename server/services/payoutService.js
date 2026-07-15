import Order from "../models/Order.js";
import Payout from "../models/Payout.js";
import Store from "../models/Store.js";
import { initiateTransfer } from "./paystackService.js";

function sameId(left, right) {
  const leftId = left?._id || left;
  const rightId = right?._id || right;
  return String(leftId) === String(rightId);
}

function getHoldDays() {
  const configured = Number(process.env.PAYOUT_HOLD_DAYS ?? 7);
  return Number.isInteger(configured) && configured >= 0 && configured <= 60 ? configured : 7;
}

export async function createPayoutForDeliveredStore(order, storeId) {
  if (order.paymentStatus !== "paid") {
    throw new Error("A payout cannot be created before the order is paid.");
  }

  const deliveredItems = order.items.filter(
    (item) => sameId(item.store, storeId) && item.fulfillmentStatus === "delivered"
  );

  if (!deliveredItems.length) {
    throw new Error("No delivered items were found for this store.");
  }

  const store = await Store.findById(storeId);
  if (!store) throw new Error("Store not found for payout.");

  const grossAmount = deliveredItems.reduce((total, item) => total + item.lineTotal, 0);
  const commissionAmount = deliveredItems.reduce((total, item) => total + item.commissionAmount, 0);
  const netAmount = deliveredItems.reduce((total, item) => total + item.sellerNet, 0);
  const deliveredAt = deliveredItems.reduce((latest, item) => {
    const date = item.deliveredAt || new Date();
    return date > latest ? date : latest;
  }, new Date(0));
  const holdUntil = new Date(deliveredAt.getTime() + getHoldDays() * 24 * 60 * 60 * 1000);
  const reference = `fh_payout_${order._id}_${store._id}`;

  const payout = await Payout.findOneAndUpdate(
    { store: store._id, order: order._id },
    {
      $setOnInsert: {
        store: store._id,
        seller: store.owner,
        order: order._id,
        grossAmount,
        commissionAmount,
        netAmount,
        reference,
        recipientCode: store.payout?.recipientCode || "",
        status: holdUntil <= new Date() ? "eligible" : "holding",
        holdUntil,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  order.payoutStatus = "holding";
  await order.save();

  return payout;
}

export async function refreshPayoutEligibility() {
  return Payout.updateMany(
    { status: "holding", holdUntil: { $lte: new Date() } },
    { $set: { status: "eligible" } }
  );
}

export async function syncOrderPayoutStatus(orderId) {
  const [order, payouts] = await Promise.all([
    Order.findById(orderId),
    Payout.find({ order: orderId }).select("status").lean(),
  ]);

  if (!order) return;

  const successCount = payouts.filter((payout) => payout.status === "success").length;
  const payableStores = new Set(
    order.items
      .filter((item) => item.fulfillmentStatus === "delivered")
      .map((item) => String(item.store))
  ).size;
  const unfinishedItems = order.items.some(
    (item) => !["delivered", "cancelled"].includes(item.fulfillmentStatus)
  );

  if (payableStores > 0 && successCount === payableStores && !unfinishedItems) {
    order.payoutStatus = "paid";
  } else if (successCount > 0) {
    order.payoutStatus = "partially_paid";
  } else if (payouts.length > 0) {
    order.payoutStatus = "holding";
  } else {
    order.payoutStatus = "not_ready";
  }

  await order.save();
}

export async function processEligiblePayouts({ limit = 20 } = {}) {
  if (process.env.ENABLE_PAYSTACK_TRANSFERS !== "true") {
    return {
      enabled: false,
      processed: 0,
      message: "Live seller transfers are disabled. Set ENABLE_PAYSTACK_TRANSFERS=true only after launch checks.",
    };
  }

  await refreshPayoutEligibility();

  const payouts = await Payout.find({ status: "eligible" })
    .sort({ holdUntil: 1 })
    .limit(limit)
    .populate("store");
  const results = [];

  for (const payout of payouts) {
    const store = payout.store;

    if (store?.payout?.status !== "verified" || !store.payout.recipientCode) {
      payout.status = "blocked";
      payout.failureMessage = "Seller payout account is not configured.";
      await payout.save();
      results.push({ payoutId: payout._id, status: "blocked" });
      continue;
    }

    const claimed = await Payout.findOneAndUpdate(
      { _id: payout._id, status: "eligible" },
      {
        $set: {
          status: "queued",
          recipientCode: store.payout.recipientCode,
          failureMessage: "",
        },
      },
      { new: true }
    );

    if (!claimed) continue;

    try {
      const transfer = await initiateTransfer({
        amountKobo: claimed.netAmount * 100,
        recipientCode: claimed.recipientCode,
        reference: claimed.reference,
        reason: `FlexHub NG marketplace order ${String(claimed.order).slice(-8)}`,
      });

      claimed.transferCode = transfer.transfer_code || "";
      claimed.processedAt = new Date();
      await claimed.save();
      results.push({ payoutId: claimed._id, status: "queued" });
    } catch (error) {
      claimed.status = "failed";
      claimed.failureMessage = String(error.message || "Transfer initiation failed.").slice(0, 300);
      claimed.processedAt = new Date();
      await claimed.save();
      results.push({ payoutId: claimed._id, status: "failed" });
    }
  }

  return { enabled: true, processed: results.length, results };
}

export async function startAutomatedPayouts() {
  if (
    process.env.ENABLE_AUTOMATED_PAYOUTS !== "true" ||
    process.env.ENABLE_PAYSTACK_TRANSFERS !== "true"
  ) {
    return null;
  }

  const run = () => {
    processEligiblePayouts().catch((error) => {
      console.error("Automated payout run failed:", error.message);
    });
  };

  run();
  return setInterval(run, 15 * 60 * 1000);
}
