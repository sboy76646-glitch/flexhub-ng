import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePaymentExpiry,
  createPaymentReference,
  getBankTransferInstructions,
  isPaymentExpired,
} from "../services/bankTransferService.js";

test("generates unique customer-facing payment references", () => {
  process.env.PAYMENT_REFERENCE_PREFIX = "FH";
  const references = new Set(Array.from({ length: 100 }, () => createPaymentReference()));
  assert.equal(references.size, 100);
  for (const reference of references) assert.match(reference, /^FH-\d{4}-[A-F0-9]{12}$/);
});

test("calculates and detects bank-transfer expiry", () => {
  process.env.BANK_TRANSFER_EXPIRY_HOURS = "24";
  const start = new Date("2026-01-01T00:00:00.000Z");
  const expiry = calculatePaymentExpiry(start);
  assert.equal(expiry.toISOString(), "2026-01-02T00:00:00.000Z");
  assert.equal(isPaymentExpired({ expiresAt: expiry }, new Date("2026-01-02T00:00:01.000Z")), true);
  assert.equal(isPaymentExpired({ expiresAt: expiry }, start), false);
});

test("returns only safe authoritative bank-transfer instructions", () => {
  process.env.FLEXHUB_BANK_NAME = "Example Bank";
  process.env.FLEXHUB_BANK_ACCOUNT_NAME = "FlexHub NG";
  process.env.FLEXHUB_BANK_ACCOUNT_NUMBER = "0123456789";
  const instructions = getBankTransferInstructions(
    { amount: 25000, currency: "NGN", reference: "FH-2026-ABCDEF123456", expiresAt: new Date("2026-01-02T00:00:00.000Z"), status: "pending" },
    { reference: "fh_order_123" }
  );
  assert.deepEqual(instructions, {
    bankName: "Example Bank",
    accountName: "FlexHub NG",
    accountNumber: "0123456789",
    amount: 25000,
    currency: "NGN",
    paymentReference: "FH-2026-ABCDEF123456",
    orderReference: "fh_order_123",
    expiresAt: new Date("2026-01-02T00:00:00.000Z"),
    status: "pending",
  });
});
