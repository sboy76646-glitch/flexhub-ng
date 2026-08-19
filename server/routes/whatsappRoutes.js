import express from "express";

const router = express.Router();

/*
 * Meta WhatsApp webhook verification.
 *
 * Meta sends:
 *   hub.mode
 *   hub.verify_token
 *   hub.challenge
 *
 * We return the challenge only when the verify token matches.
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const expectedToken = String(
    process.env.WHATSAPP_VERIFY_TOKEN || ""
  ).trim();

  if (!expectedToken) {
    console.error("❌ WHATSAPP_VERIFY_TOKEN is not configured.");
    return res.sendStatus(500);
  }

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ WhatsApp webhook verified.");
    return res.status(200).send(challenge);
  }

  console.warn("❌ WhatsApp webhook verification failed.");

  return res.sendStatus(403);
});

/*
 * WhatsApp webhook events.
 *
 * For now we acknowledge Meta immediately.
 * We'll add incoming-message handling next.
 */
router.post("/webhook", (req, res) => {
  try {
    console.log(
      "📩 WhatsApp webhook received:",
      JSON.stringify(req.body, null, 2)
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ WhatsApp webhook error:",
      error
    );

    return res.sendStatus(500);
  }
});

export default router;