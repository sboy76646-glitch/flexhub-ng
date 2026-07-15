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

async function commitInventoryWithoutTransaction(orderId) {
  const claimedOrder = await Order.findOneAndUpdate(
    { _id: orderId, inventoryStatus: "pending" },
    { $set: { inventoryStatus: "committing", inventoryIssue: "" } },
    { new: true }
  );

  if (!claimedOrder) return Order.findById(orderId);

  const adjustedItems = [];

  for (const item of claimedOrder.items) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (result.modifiedCount !== 1) {
      for (const adjustedItem of adjustedItems) {
        await Product.updateOne(
          { _id: adjustedItem.product },
          { $inc: { stock: adjustedItem.quantity } }
        );
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
        const result = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
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

  if (order.paymentStatus !== "paid") {
    order = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: "paid" } },
      {
        $set: {
          paymentStatus: "paid",
          paidAt: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
          paystackTransactionId: String(transaction.id || ""),
        },
      },
      { new: true }
    ) || await Order.findById(order._id);
  }

  if (["pending", "committing"].includes(order.inventoryStatus)) {
    order = await commitInventory(order._id);
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
