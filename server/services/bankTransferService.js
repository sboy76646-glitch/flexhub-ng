import crypto from "crypto";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

function configuredExpiryHours() {
  const value = Number(process.env.BANK_TRANSFER_EXPIRY_HOURS ?? 24);

  return Number.isFinite(value) && value >= 1 && value <= 168
    ? value
    : 24;
}

function requiredBankDetail(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    const error = new Error(
      "Bank-transfer payments are not fully configured."
    );

    error.code = "BANK_TRANSFER_NOT_CONFIGURED";

    throw error;
  }

  return value;
}

export function bankTransfersEnabled() {
  return process.env.BANK_TRANSFER_PAYMENTS_ENABLED === "true";
}

export function getWhatsAppNumber() {
  const value = String(process.env.FLEXHUB_WHATSAPP_NUMBER || "").replace(
    /\D/g,
    ""
  );

  if (!value) {
    const error = new Error(
      "FlexHub WhatsApp number is not configured."
    );

    error.code = "WHATSAPP_NOT_CONFIGURED";

    throw error;
  }

  return value;
}

export function createPaymentReference() {
  const prefix =
    String(process.env.PAYMENT_REFERENCE_PREFIX || "FH")
      .trim()
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 12) || "FH";

  const year = new Date().getUTCFullYear();

  return `${prefix}-${year}-${crypto
    .randomBytes(6)
    .toString("hex")
    .toUpperCase()}`;
}

export function calculatePaymentExpiry(from = new Date()) {
  return new Date(
    from.getTime() +
      configuredExpiryHours() * 60 * 60 * 1000
  );
}

export function isPaymentExpired(
  payment,
  now = new Date()
) {
  return Boolean(
    payment.expiresAt &&
      new Date(payment.expiresAt) <= now
  );
}

export async function expireBankTransferPayment(
  payment,
  now = new Date()
) {
  if (
    payment.method !== "bank_transfer" ||
    payment.status !== "pending" ||
    !isPaymentExpired(payment, now)
  ) {
    return payment;
  }

  const expired = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "pending",
      expiresAt: { $lte: now },
    },
    {
      $set: {
        status: "expired",
        failureReason:
          "Bank-transfer payment window expired.",
      },
    },
    {
      new: true,
    }
  );

  if (expired) {
    await Order.updateOne(
      {
        _id: payment.order,
        paymentMethod: "bank_transfer",
        paymentStatus: "pending",
      },
      {
        $set: {
          paymentExpiresAt: expired.expiresAt,
        },
      }
    );
  }

  return expired || Payment.findById(payment._id);
}

export function getBankTransferInstructions(
  payment,
  order
) {
  return {
    bankName: requiredBankDetail(
      "FLEXHUB_BANK_NAME"
    ),
    accountName: requiredBankDetail(
      "FLEXHUB_BANK_ACCOUNT_NAME"
    ),
    accountNumber: requiredBankDetail(
      "FLEXHUB_BANK_ACCOUNT_NUMBER"
    ),
    amount: payment.amount,
    currency: payment.currency,
    paymentReference: payment.reference,
    orderReference: order.reference,
    expiresAt: payment.expiresAt,
    status: payment.status,
  };
}

export function buildWhatsAppMessage(
  payment,
  order,
  instructions
) {
  const formattedAmount = Number(
    payment.amount
  ).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return [
    "Hello FlexHub 👋",
    "",
    "I want to complete my bank transfer payment.",
    "",
    `Order: ${order.reference}`,
    `Payment Reference: ${payment.reference}`,
    `Amount: ${instructions.currency} ${formattedAmount}`,
    "",
    "Please confirm my payment instructions.",
  ].join("\n");
}

export function buildWhatsAppUrl(
  payment,
  order,
  instructions
) {
  const number = getWhatsAppNumber();

  const message = buildWhatsAppMessage(
    payment,
    order,
    instructions
  );

  return `https://wa.me/${number}?text=${encodeURIComponent(
    message
  )}`;
}

export async function createBankTransferPayment(
  order
) {
  if (!bankTransfersEnabled()) {
    const error = new Error(
      "Bank-transfer payments are not enabled."
    );

    error.code = "BANK_TRANSFER_DISABLED";

    throw error;
  }

  const existing = await Payment.findOne({
    order: order._id,
    method: "bank_transfer",
  });

  if (existing) {
    return expireBankTransferPayment(existing);
  }

  const expiresAt = calculatePaymentExpiry();

  let payment;

  try {
    payment = await Payment.create({
      order: order._id,
      customer: order.customer,
      method: "bank_transfer",
      reference: createPaymentReference(),
      amount: order.total,
      currency: order.currency,
      expiresAt,
      source: "checkout",
    });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    payment = await Payment.findOne({
      order: order._id,
      method: "bank_transfer",
    });

    if (!payment) {
      throw error;
    }

    return expireBankTransferPayment(payment);
  }

  await Order.updateOne(
    {
      _id: order._id,
      paymentStatus: "pending",
    },
    {
      $set: {
        paymentMethod: "bank_transfer",
        paymentReference: payment.reference,
        paymentExpiresAt: expiresAt,
      },
    }
  );

  return payment;
}