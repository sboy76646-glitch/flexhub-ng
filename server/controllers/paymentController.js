import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payout from "../models/Payout.js";
import Product from "../models/Product.js";
import { customerOrderView } from "./orderController.js";
import {
  hasValidWebhookSignature,
  initializeTransaction,
  verifyTransaction,
} from "../services/paystackService.js";
import { syncOrderPayoutStatus } from "../services/payoutService.js";
import { createNotifications } from "../services/notificationService.js";

async function commitInventoryWithoutTransaction(orderId) {
  const claimedOrder = await Order.findOneAndUpdate(
    { _id: orderId, inventoryStatus: "pending" },
    { $set: { inventoryStatus: "committing", inventoryIssue: "" } },
    { new: true }
  );

  if (!claimedOrder) return Order.findById(orderId);

  const adjustedItems = [];

  for (const item of claimedOrder.items) {
    const inventoryFilter = { _id: item.product, stock: { $gte: item.quantity } };
    const inventoryChange = { stock: -item.quantity };
    if (item.size) {
      inventoryFilter.sizes = { $elemMatch: { label: item.size, stock: { $gte: item.quantity } } };
      inventoryChange["sizes.$.stock"] = -item.quantity;
    }
    const result = await Product.updateOne(inventoryFilter, { $inc: inventoryChange });

    if (result.modifiedCount !== 1) {
      for (const adjustedItem of adjustedItems) {
        const rollback = { stock: adjustedItem.quantity };
        const rollbackFilter = { _id: adjustedItem.product };
        if (adjustedItem.size) {
          rollback["sizes.$.stock"] = adjustedItem.quantity;
          rollbackFilter["sizes.label"] = adjustedItem.size;
        }
        await Product.updateOne(rollbackFilter, { $inc: rollback });
      }

      return Order.findByIdAndUpdate(
        claimedOrder._id,
        {
          inventoryStatus: "attention",
          inventoryIssue: `Stock changed before payment was confirmed for ${item.name}. Admin review is required.`,
        },
        { new: true }
      );
    }

    adjustedItems.push(item);
  }

  return Order.findByIdAndUpdate(
    claimedOrder._id,
    { inventoryStatus: "committed", inventoryIssue: "" },
    { new: true }
  );
}

function transactionIsUnsupported(error) {
  return error?.code === 20
    || /transaction numbers are only allowed|replica set|does not support transactions/i.test(error?.message || "");
}

async function commitInventoryInTransaction(orderId) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId, inventoryStatus: "pending" }).session(session);
      if (!order) return;

      for (const item of order.items) {
        const inventoryFilter = { _id: item.product, stock: { $gte: item.quantity } };
        const inventoryChange = { stock: -item.quantity };
        if (item.size) {
          inventoryFilter.sizes = { $elemMatch: { label: item.size, stock: { $gte: item.quantity } } };
          inventoryChange["sizes.$.stock"] = -item.quantity;
        }
        const result = await Product.updateOne(
          inventoryFilter,
          { $inc: inventoryChange },
          { session }
        );

        if (result.modifiedCount !== 1) {
          const error = new Error(`Stock changed before payment was confirmed for ${item.name}. Admin review is required.`);
          error.code = "INVENTORY_SHORTAGE";
          throw error;
        }
      }

      order.inventoryStatus = "committed";
      order.inventoryIssue = "";
      await order.save({ session });
    });

    return Order.findById(orderId);
  } catch (error) {
    if (error.code === "INVENTORY_SHORTAGE") {
      return Order.findByIdAndUpdate(
        orderId,
        { inventoryStatus: "attention", inventoryIssue: error.message },
        { new: true }
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

async function commitInventory(orderId) {
  try {
    return await commitInventoryInTransaction(orderId);
  } catch (error) {
    if (transactionIsUnsupported(error)) {
      return commitInventoryWithoutTransaction(orderId);
    }

    throw error;
  }
}

function validateSuccessfulTransaction(order, transaction) {
  if (transaction.reference !== order.reference) {
    throw new Error("The confirmed payment reference does not match this order.");
  }

  if (transaction.status !== "success") {
    throw new Error("Paystack has not confirmed this payment as successful.");
  }

  if (Number(transaction.amount) !== order.total * 100) {
    throw new Error("The confirmed payment amount does not match this order.");
  }

  if (String(transaction.currency).toUpperCase() !== order.currency) {
    throw new Error("The confirmed payment currency does not match this order.");
  }
}

export async function finalizeSuccessfulPayment(reference, transaction) {
  let order = await Order.findOne({ reference });
  if (!order) throw new Error("Order not found for this payment reference.");

  validateSuccessfulTransaction(order, transaction);

  return finalizeOrderPayment(order, {
    method: "paystack",
    transactionId: String(transaction.id || ""),
    paidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
  });
}

export async function finalizeOrderPayment(order, { method, transactionId = "", paidAt = new Date() }) {
  if (!order) throw new Error("Order not found for payment confirmation.");

  const wasAlreadyPaid = order.paymentStatus === "paid";
  if (!wasAlreadyPaid) {
    const paymentUpdate = {
      paymentStatus: "paid",
      paymentMethod: method,
      paidAt,
      paymentConfirmedAt: paidAt,
    };
    if (method === "paystack") paymentUpdate.paystackTransactionId = transactionId;
    order = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "paid" } },
      { $set: paymentUpdate },
      { new: true }
    ) || await Order.findById(order._id);
  }

  if (["pending", "committing"].includes(order.inventoryStatus)) {
    order = await commitInventory(order._id);
  }

  if (!wasAlreadyPaid) {
    const sellerIds = [...new Set(order.items.map((item) => String(item.seller)))];
    await createNotifications([
      {
        recipient: order.customer,
        type: "payment",
        title: "Payment confirmed",
        message: `Your payment for order ${order.reference} was confirmed.`,
        link: "/orders",
        metadata: { orderId: order._id, reference: order.reference },
      },
      ...sellerIds.map((seller) => ({
        recipient: seller,
        type: "order",
        title: "New paid order",
        message: `A customer paid for order ${order.reference}. Start preparing it now.`,
        link: "/seller",
        metadata: { orderId: order._id, reference: order.reference },
      })),
    ]);
  }

  return order;
}

export async function initializeOrderPayment(req, res) {
  if (!mongoose.isValidObjectId(req.params.orderId)) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const order = await Order.findOne({ _id: req.params.orderId, customer: req.user._id });

  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  if (order.paymentStatus === "paid") {
    return res.status(409).json({ success: false, message: "This order has already been paid." });
  }
  if (order.fulfillmentStatus === "cancelled") {
    return res.status(409).json({ success: false, message: "A cancelled order cannot be paid." });
  }

  try {
    const clientUrl = String(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    const payment = await initializeTransaction({
      email: order.customerEmail,
      amountKobo: order.total * 100,
      reference: order.reference,
      callbackUrl: `${clientUrl}/payment/callback`,
      metadata: {
        order_id: String(order._id),
        marketplace: "FlexHub NG",
      },
    });

    if (!payment.authorization_url) {
      throw new Error("Paystack did not return a secure payment link.");
    }

    return res.json({
      success: true,
      authorizationUrl: payment.authorization_url,
      accessCode: payment.access_code,
      reference: order.reference,
    });
  } catch (error) {
    const status = error.code === "PAYSTACK_NOT_CONFIGURED" ? 503 : 502;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function verifyOrderPayment(req, res) {
  const order = await Order.findOne({ reference: req.params.reference, customer: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  try {
    const transaction = await verifyTransaction(order.reference);
    const updatedOrder = await finalizeSuccessfulPayment(order.reference, transaction);

    return res.json({
      success: true,
      message: updatedOrder.inventoryStatus === "committed"
        ? "Payment confirmed. Your order is now with the seller."
        : "Payment confirmed. The FlexHub NG team is checking product availability.",
      order: customerOrderView(updatedOrder.toObject()),
    });
  } catch (error) {
    const status = error.code === "PAYSTACK_NOT_CONFIGURED" ? 503 : 409;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function handlePaystackWebhook(req, res) {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!hasValidWebhookSignature(req.body, signature)) {
      return res.status(401).json({ success: false, message: "Invalid webhook signature." });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "charge.success") {
      await finalizeSuccessfulPayment(event.data.reference, event.data);
    }

    const payoutStatusByEvent = {
      "transfer.success": "success",
      "transfer.failed": "failed",
      "transfer.reversed": "reversed",
    };
    const payoutStatus = payoutStatusByEvent[event.event];

    if (payoutStatus && event.data?.reference) {
      const payout = await Payout.findOneAndUpdate(
        { reference: event.data.reference },
        {
          $set: {
            status: payoutStatus,
            transferCode: event.data.transfer_code || "",
            processedAt: new Date(),
            failureMessage: payoutStatus === "failed"
              ? String(event.data.reason || "Paystack reported that this transfer failed.").slice(0, 300)
              : "",
          },
        },
        { new: true }
      );

      if (payout) await syncOrderPayoutStatus(payout.order);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("Paystack webhook error:", error.message);
    return res.sendStatus(500);
  }
}
