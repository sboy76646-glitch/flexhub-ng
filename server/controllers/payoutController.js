import mongoose from "mongoose";

import Payout from "../models/Payout.js";
import {
  createTransferRecipient,
  listNigerianBanks,
  resolveBankAccount,
} from "../services/paystackService.js";
import {
  processEligiblePayouts,
  refreshPayoutEligibility,
} from "../services/payoutService.js";

function configurationErrorStatus(error) {
  return error.code === "PAYSTACK_NOT_CONFIGURED" ? 503 : 502;
}

export async function listBanks(req, res) {
  try {
    const banks = await listNigerianBanks();
    return res.json({
      success: true,
      banks: banks
        .filter((bank) => bank.active !== false)
        .map((bank) => ({ name: bank.name, code: bank.code }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    });
  } catch (error) {
    return res.status(configurationErrorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function configurePayoutAccount(req, res) {
  const accountNumber = String(req.body.accountNumber || "").trim();
  const bankCode = String(req.body.bankCode || "").trim();

  if (!/^\d{10}$/.test(accountNumber) || !bankCode) {
    return res.status(400).json({ success: false, message: "Enter a valid 10-digit account number and choose a bank." });
  }

  try {
    const [resolved, banks] = await Promise.all([
      resolveBankAccount(accountNumber, bankCode),
      listNigerianBanks(),
    ]);
    const bank = banks.find((item) => String(item.code) === bankCode);

    if (!resolved?.account_name || !bank) {
      return res.status(400).json({ success: false, message: "Paystack could not verify this bank account." });
    }

    const recipient = await createTransferRecipient({
      name: resolved.account_name,
      accountNumber,
      bankCode,
    });

    req.store.payout = {
      status: "verified",
      recipientCode: recipient.recipient_code,
      bankCode,
      bankName: bank.name,
      accountName: resolved.account_name,
      accountLast4: accountNumber.slice(-4),
      verifiedAt: new Date(),
    };
    await req.store.save();

    await Promise.all([
      Payout.updateMany(
        { store: req.store._id, status: "blocked", holdUntil: { $lte: new Date() } },
        { $set: { status: "eligible", failureMessage: "" } }
      ),
      Payout.updateMany(
        { store: req.store._id, status: "blocked", holdUntil: { $gt: new Date() } },
        { $set: { status: "holding", failureMessage: "" } }
      ),
    ]);

    return res.json({
      success: true,
      message: `Payout account verified as ${resolved.account_name}.`,
      payoutAccount: {
        status: req.store.payout.status,
        bankName: req.store.payout.bankName,
        accountName: req.store.payout.accountName,
        accountLast4: req.store.payout.accountLast4,
      },
    });
  } catch (error) {
    return res.status(configurationErrorStatus(error)).json({ success: false, message: error.message });
  }
}

export async function getSellerPayouts(req, res) {
  await refreshPayoutEligibility();

  const payouts = await Payout.find({ store: req.store._id })
    .select("-recipientCode -transferCode")
    .populate("order", "reference deliveredAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const totals = payouts.reduce(
    (summary, payout) => {
      summary.gross += payout.grossAmount;
      summary.commission += payout.commissionAmount;
      summary.net += payout.netAmount;

      if (payout.status === "success") summary.paid += payout.netAmount;
      if (payout.status === "eligible") summary.available += payout.netAmount;
      if (["holding", "queued", "blocked", "failed", "reversed"].includes(payout.status)) {
        summary.pending += payout.netAmount;
      }

      return summary;
    },
    { gross: 0, commission: 0, net: 0, paid: 0, available: 0, pending: 0 }
  );

  return res.json({
    success: true,
    payouts,
    totals,
    commissionRatePercent: req.store.commissionRateBps / 100,
    payoutAccount: {
      status: req.store.payout?.status || "unconfigured",
      bankName: req.store.payout?.bankName || "",
      accountName: req.store.payout?.accountName || "",
      accountLast4: req.store.payout?.accountLast4 || "",
    },
    automationEnabled: process.env.ENABLE_AUTOMATED_PAYOUTS === "true"
      && process.env.ENABLE_PAYSTACK_TRANSFERS === "true",
    holdDays: (() => {
      const configured = Number(process.env.PAYOUT_HOLD_DAYS ?? 7);
      return Number.isInteger(configured) && configured >= 0 && configured <= 60 ? configured : 7;
    })(),
  });
}

export async function listAdminPayouts(req, res) {
  await refreshPayoutEligibility();

  const query = {};
  const allowedStatuses = ["holding", "eligible", "queued", "success", "failed", "reversed", "blocked"];
  if (allowedStatuses.includes(req.query.status)) query.status = req.query.status;

  const payouts = await Payout.find(query)
    .select("-recipientCode -transferCode")
    .populate("store", "name slug payout.status payout.bankName payout.accountName payout.accountLast4")
    .populate("seller", "firstName lastName email")
    .populate("order", "reference")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const totals = payouts.reduce(
    (summary, payout) => ({
      gross: summary.gross + payout.grossAmount,
      commission: summary.commission + payout.commissionAmount,
      sellerNet: summary.sellerNet + payout.netAmount,
    }),
    { gross: 0, commission: 0, sellerNet: 0 }
  );

  return res.json({
    success: true,
    payouts,
    totals,
    transfersEnabled: process.env.ENABLE_PAYSTACK_TRANSFERS === "true",
    automationEnabled: process.env.ENABLE_AUTOMATED_PAYOUTS === "true"
      && process.env.ENABLE_PAYSTACK_TRANSFERS === "true",
  });
}

export async function processAdminPayouts(req, res) {
  const result = await processEligiblePayouts();
  return res.status(result.enabled ? 200 : 409).json({
    success: result.enabled,
    ...result,
  });
}

export async function retryAdminPayout(req, res) {
  if (!mongoose.isValidObjectId(req.params.payoutId)) {
    return res.status(404).json({ success: false, message: "Payout not found." });
  }

  const payout = await Payout.findById(req.params.payoutId).populate("store");
  if (!payout) return res.status(404).json({ success: false, message: "Payout not found." });
  if (!["failed", "reversed", "blocked"].includes(payout.status)) {
    return res.status(409).json({ success: false, message: "Only failed, reversed or blocked payouts can be retried." });
  }
  if (payout.holdUntil > new Date()) {
    return res.status(409).json({ success: false, message: "This payout is still in its hold period." });
  }
  if (payout.store?.payout?.status !== "verified") {
    return res.status(409).json({ success: false, message: "The seller must configure a verified payout account first." });
  }

  payout.status = "eligible";
  payout.failureMessage = "";
  payout.recipientCode = payout.store.payout.recipientCode;
  await payout.save();

  const safePayout = payout.toObject();
  delete safePayout.recipientCode;
  delete safePayout.transferCode;
  if (safePayout.store?.payout) {
    delete safePayout.store.payout.recipientCode;
  }

  return res.json({
    success: true,
    message: "Payout returned to the eligible queue. Its original reference will be reused safely.",
    payout: safePayout,
  });
}
