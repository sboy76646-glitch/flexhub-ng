import test from "node:test";
import assert from "node:assert/strict";

import {
  parseMoniepointCreditEmail,
  extractFlexHubReference,
} from "../services/moniepointParser.js";

test("parses a Moniepoint credit alert", () => {
  const email = `
Hi DANIEL,

We wish to inform you that a credit transaction occurred on your account with us.

Credit Amount

10,000.00

Transaction Details

Account Balance:
N 10,010.16

Account Number:
1234567890

Sender's Name:
from PHILIP NWEBONYI NWUBE

Date & Time:
17 Aug, 2026 | 09:31:52 AM

Narration:
Transfer from PHILIP NWEBONYI NWUBE
`;

  const result = parseMoniepointCreditEmail(email);

  assert.ok(result);
  assert.equal(result.type, "credit");
  assert.equal(result.amount, 10000);
  assert.equal(result.currency, "NGN");
  assert.equal(result.senderName, "PHILIP NWEBONYI NWUBE");
  assert.equal(
    result.transactionDate,
    "17 Aug, 2026 | 09:31:52 AM"
  );
  assert.equal(
    result.narration,
    "Transfer from PHILIP NWEBONYI NWUBE"
  );
  assert.equal(result.transactionReference, "");
});

test("extracts a FlexHub payment reference", () => {
  const reference = extractFlexHubReference(
    "Transfer from FH-2026-A1B2C3D4E5F6"
  );

  assert.equal(
    reference,
    "FH-2026-A1B2C3D4E5F6"
  );
});

test("returns null for non-credit emails", () => {
  const result = parseMoniepointCreditEmail(`
    Debit alert!
    Amount: 10,000.00
  `);

  assert.equal(result, null);
});

test("returns null when credit amount is missing", () => {
  const result = parseMoniepointCreditEmail(`
    A credit transaction occurred on your account.

    Sender's Name:
    from SOMEONE

    Narration:
    Transfer from SOMEONE
  `);

  assert.equal(result, null);
});