import mongoose from "mongoose";

import Order from "../models/Order.js";

import {
  bankTransfersEnabled,
  buildWhatsAppUrl,
  createBankTransferPayment,
  getBankTransferInstructions,
} from "../services/bankTransferService.js";

export async function getBankTransferConfig(
  req,
  res
) {
  if (!bankTransfersEnabled()) {
    return res.json({
      success: true,
      enabled: false,
      whatsappEnabled: false,
    });
  }

  return res.json({
    success: true,
    enabled: true,
    whatsappEnabled: Boolean(
      String(
        process.env.FLEXHUB_WHATSAPP_NUMBER || ""
      ).trim()
    ),
  });
}

export async function createBankTransferOrder(
  req,
  res
) {
  if (
    !mongoose.isValidObjectId(
      req.params.orderId
    )
  ) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  if (order.paymentStatus === "paid") {
    return res.status(409).json({
      success: false,
      message: "This order has already been paid.",
    });
  }

  if (
    order.fulfillmentStatus === "cancelled"
  ) {
    return res.status(409).json({
      success: false,
      message:
        "A cancelled order cannot be paid.",
    });
  }

  try {
    const payment =
      await createBankTransferPayment(order);

    const instructions =
      getBankTransferInstructions(
        payment,
        order
      );

    let whatsappUrl = null;

    try {
      whatsappUrl = buildWhatsAppUrl(
        payment,
        order,
        instructions
      );
    } catch (error) {
      if (
        error?.code !==
        "WHATSAPP_NOT_CONFIGURED"
      ) {
        throw error;
      }
    }

    return res.json({
      success: true,

      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        expiresAt: payment.expiresAt,
      },

      instructions,

      whatsappUrl,
    });
  } catch (error) {
    let status = 500;

    if (
      error?.code ===
        "BANK_TRANSFER_DISABLED" ||
      error?.code ===
        "BANK_TRANSFER_NOT_CONFIGURED" ||
      error?.code ===
        "WHATSAPP_NOT_CONFIGURED"
    ) {
      status = 503;
    }

    return res.status(status).json({
      success: false,
      message:
        error?.message ||
        "Unable to create bank-transfer payment.",
    });
  }
}

export async function getBankTransferOrder(
  req,
  res
) {
  if (
    !mongoose.isValidObjectId(
      req.params.orderId
    )
  ) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  const order = await Order.findOne({
    _id: req.params.orderId,
    customer: req.user._id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found.",
    });
  }

  return res.json({
    success: true,

    payment: {
      method: order.paymentMethod,
      reference: order.paymentReference,
      status: order.paymentStatus,
      expiresAt: order.paymentExpiresAt,
      detectedAt: order.paymentDetectedAt,
      confirmedAt: order.paymentConfirmedAt,
    },
  });
}