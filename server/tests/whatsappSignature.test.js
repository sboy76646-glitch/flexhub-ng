import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { hasValidMetaSignature } from "../routes/whatsappRoutes.js";

test("validates Meta webhook signatures against the raw request body", () => {
  const secret = "local-test-secret";
  const rawBody = Buffer.from('{"object":"whatsapp_business_account","entry":[]}');
  process.env.WHATSAPP_APP_SECRET = secret;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const req = { rawBody, get: () => `sha256=${digest}` };
  assert.equal(hasValidMetaSignature(req), true);
});

test("rejects invalid and missing webhook signatures", () => {
  process.env.WHATSAPP_APP_SECRET = "local-test-secret";
  const rawBody = Buffer.from("{}");
  assert.equal(hasValidMetaSignature({ rawBody, get: () => `sha256=${"0".repeat(64)}` }), false);
  assert.equal(hasValidMetaSignature({ rawBody, get: () => undefined }), false);
});
