import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import { finalizeOrderPayment } from "../controllers/paymentController.js";
import { expireBankTransferPayment, isPaymentExpired } from "./bankTransferService.js";

function normalizedText(value) {
  return String(value || "").trim();
}

export async function reconcileBankTransferTransaction(transaction) {
  const transactionReference = normalizedText(transaction.transactionReference);
  const externalTransactionId = normalizedText(transaction.externalTransactionId);
  const amount = Number(transaction.amount);
  const currency = normalizedText(transaction.currency).toUpperCase();

  if (!transactionReference || !externalTransactionId || !Number.isFinite(amount) || amount < 0 || !currency) {
    return { result: "review_required", message: "The transaction is missing a reference, external ID, amount, or currency." };
  }

  const duplicate = await Payment.findOne({ externalTransactionId });
  if (duplicate) {
    return {
      result: duplicate.status === "paid" ? "already_processed" : "review_required",
      paymentId: duplicate._id,
      message: "This external transaction ID has already been recorded.",
    };
  }

  let payment = await Payment.findOne({ method: "bank_transfer", reference: transactionReference });
  if (!payment) return { result: "not_found", message: "No bank-transfer payment matches this reference." };
  if (payment.status === "paid") return { result: "already_processed", paymentId: payment._id };

  if (isPaymentExpired(payment)) {
    payment = await expireBankTransferPayment(payment);
    return { result: "expired", paymentId: payment._id, message: "The bank-transfer payment has expired." };
  }
  if (payment.status !== "pending") {
    return { result: "review_required", paymentId: payment._id, message: `Payment is currently ${payment.status}.` };
  }
  if (payment.amount !== amount) {
    return { result: "amount_mismatch", paymentId: payment._id, message: "The transaction amount does not match the pending payment." };
  }
  if (payment.currency !== currency) {
    return { result: "review_required", paymentId: payment._id, message: "The transaction currency does not match the pending payment." };
  }

  try {
    payment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: "pending", externalTransactionId: { $exists: false } },
      {
        $set: {
          status: "processing",
          externalTransactionId,
          transactionReference,
          detectedAt: transaction.transactionDate ? new Date(transaction.transactionDate) : new Date(),
          source: normalizedText(transaction.source).slice(0, 80),
          metadata: transaction.metadata || {},
        },
      },
      { new: true }
    );
  } catch (error) {
    if (error?.code === 11000) return { result: "already_processed", message: "This external transaction has already been claimed." };
    throw error;
  }

  if (!payment) return { result: "already_processed", message: "This payment is already being processed." };

  try {
    const order = await Order.findById(payment.order);
    if (!order) throw new Error("The order for this payment no longer exists.");
    if (order.paymentStatus === "paid") {
      await Payment.updateOne({ _id: payment._id }, { $set: { status: "paid", confirmedAt: order.paymentConfirmedAt || new Date() } });
      return { result: "already_processed", paymentId: payment._id, orderId: order._id };
    }

    const paidAt = transaction.transactionDate ? new Date(transaction.transactionDate) : new Date();
    const finalizedOrder = await finalizeOrderPayment(order, { method: "bank_transfer", transactionId: externalTransactionId, paidAt });
    await Payment.updateOne(
      { _id: payment._id, status: "processing" },
      { $set: { status: "paid", confirmedAt: paidAt } }
    );
    await Order.updateOne({ _id: finalizedOrder._id }, { $set: { paymentDetectedAt: payment.detectedAt, paymentConfirmedAt: paidAt } });
    return { result: "matched", paymentId: payment._id, orderId: finalizedOrder._id };
  } catch (error) {
    await Payment.updateOne(
      { _id: payment._id, status: "processing" },
      { $set: { status: "review_required", reviewReason: String(error.message || "Payment finalization needs review.").slice(0, 500) } }
    );
    return { result: "review_required", paymentId: payment._id, message: "The transfer was matched but requires review before completion." };
  }
}
