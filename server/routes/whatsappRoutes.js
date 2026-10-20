import crypto from "crypto";
import express from "express";

const router = express.Router();

export function hasValidMetaSignature(req) {
  const appSecret = String(process.env.WHATSAPP_APP_SECRET || "").trim();
  const signature = req.get("x-hub-signature-256") || "";
  const rawBody = req.rawBody;

  if (!appSecret || !Buffer.isBuffer(rawBody) || !signature.startsWith("sha256=")) {
    return false;
  }

  const suppliedHex = signature.slice("sha256=".length);
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest();

  const supplied = Buffer.from(suppliedHex, "hex");
  return supplied.length === expected.length &&
    crypto.timingSafeEqual(supplied, expected);
}

/*
 * Meta webhook verification handshake.
 * Configure WHATSAPP_VERIFY_TOKEN in the server environment.
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expectedToken = String(process.env.WHATSAPP_VERIFY_TOKEN || "").trim();

  if (!expectedToken) {
    console.error("WhatsApp webhook verification token is not configured.");
    return res.sendStatus(500);
  }

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/*
 * Acknowledge only authentic Meta events. Never log the full payload because
 * webhook events can contain phone numbers and message contents.
 */
router.post("/webhook", (req, res) => {
  if (!hasValidMetaSignature(req)) {
    console.warn("Rejected WhatsApp webhook with missing or invalid signature.");
    return res.sendStatus(401);
  }

  const object = req.body?.object;
  if (object !== "whatsapp_business_account") {
    return res.sendStatus(400);
  }

  const entryCount = Array.isArray(req.body?.entry) ? req.body.entry.length : 0;
  console.info("Accepted WhatsApp webhook event.", { object, entryCount });
  return res.sendStatus(200);
});

export default router;
