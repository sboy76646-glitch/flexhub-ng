import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    const error = new Error("Paystack is not configured on this server.");
    error.code = "PAYSTACK_NOT_CONFIGURED";
    throw error;
  }

  return secretKey;
}

async function paystackRequest(path, { method = "GET", body } = {}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method,
    signal: AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.status) {
    const error = new Error(result.message || "Paystack could not complete the request.");
    error.status = response.status;
    error.details = result;
    throw error;
  }

  return result.data;
}

export function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: {
      email,
      amount: amountKobo,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata,
    },
  });
}

export function verifyTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function listNigerianBanks() {
  return paystackRequest("/bank?country=nigeria&currency=NGN&perPage=100");
}

export function resolveBankAccount(accountNumber, bankCode) {
  const query = new URLSearchParams({
    account_number: accountNumber,
    bank_code: bankCode,
  });

  return paystackRequest(`/bank/resolve?${query.toString()}`);
}

export function createTransferRecipient({ name, accountNumber, bankCode }) {
  return paystackRequest("/transferrecipient", {
    method: "POST",
    body: {
      type: "nuban",
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    },
  });
}

export function initiateTransfer({ amountKobo, recipientCode, reference, reason }) {
  return paystackRequest("/transfer", {
    method: "POST",
    body: {
      source: "balance",
      amount: amountKobo,
      recipient: recipientCode,
      reference,
      reason,
    },
  });
}

export function hasValidWebhookSignature(rawBody, signature = "") {
  if (!Buffer.isBuffer(rawBody) || !signature) return false;

  const expected = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");

  const suppliedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    suppliedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}
