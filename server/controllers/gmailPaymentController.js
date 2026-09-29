import { reconcileMoniepointCreditEmails } from "../services/gmailPaymentReconciliationService.js";

export async function runGmailPaymentReconciliation(req, res) {
  try {
    const result = await reconcileMoniepointCreditEmails();
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error("Manual Gmail payment reconciliation error:", error);

    const status = error?.code === "GMAIL_NOT_CONFIGURED" ? 503 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Unable to reconcile Gmail payment alerts.",
    });
  }
}
