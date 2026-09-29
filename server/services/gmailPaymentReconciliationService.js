import { createAuthenticatedGmailClient } from "./gmailService.js";
import { parseMoniepointCreditEmail } from "./moniepointParser.js";
import { reconcileBankTransferTransaction } from "./paymentReconciliationService.js";

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    const error = new Error(`${name} is not configured.`);
    error.code = "GMAIL_NOT_CONFIGURED";
    throw error;
  }

  return value;
}

function decodeBase64Url(value) {
  if (!value) return "";

  const normalized = String(value)
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(String(value).length / 4) * 4, "=");

  return Buffer.from(normalized, "base64").toString("utf8");
}

function extractTextFromPayload(payload) {
  if (!payload) return "";

  const mimeType = String(payload.mimeType || "").toLowerCase();
  const body = payload.body?.data;

  if (body && (mimeType === "text/plain" || mimeType === "text/html" || !payload.parts?.length)) {
    return decodeBase64Url(body);
  }

  return (payload.parts || [])
    .map((part) => extractTextFromPayload(part))
    .filter(Boolean)
    .join("\n");
}

function safeTransactionDate(value, fallback) {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback;
}

async function listCandidateMessages(gmail) {
  const query = String(
    process.env.GMAIL_PAYMENT_SEARCH_QUERY ||
      'newer_than:2d "Credit transaction occurred"'
  ).trim();

  const maxResults = Math.min(
    Math.max(Number(process.env.GMAIL_PAYMENT_MAX_RESULTS || 50), 1),
    100
  );

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  return response.data.messages || [];
}

export async function reconcileMoniepointCreditEmails() {
  if (process.env.ENABLE_GMAIL_RECONCILIATION !== "true") {
    return {
      enabled: false,
      scanned: 0,
      matched: 0,
      reviewRequired: 0,
      skipped: 0,
      results: [],
    };
  }

  const refreshToken = requiredEnv("GMAIL_REFRESH_TOKEN");
  const gmail = createAuthenticatedGmailClient(refreshToken);
  const messages = await listCandidateMessages(gmail);
  const results = [];

  for (const message of messages) {
    if (!message.id) continue;

    try {
      const fullMessage = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });

      const body = extractTextFromPayload(fullMessage.data.payload);
      const parsed = parseMoniepointCreditEmail(body);

      if (!parsed) {
        results.push({ messageId: message.id, result: "skipped" });
        continue;
      }

      const fallbackDate = fullMessage.data.internalDate
        ? new Date(Number(fullMessage.data.internalDate)).toISOString()
        : new Date().toISOString();

      const reconciliation = await reconcileBankTransferTransaction({
        ...parsed,
        externalTransactionId: `gmail:${message.id}`,
        transactionDate: safeTransactionDate(parsed.transactionDate, fallbackDate),
        source: "gmail-moniepoint",
        metadata: {
          gmailMessageId: message.id,
          gmailThreadId: fullMessage.data.threadId || "",
          gmailLabelIds: fullMessage.data.labelIds || [],
          subject: (fullMessage.data.payload?.headers || []).find(
            (header) => String(header.name).toLowerCase() === "subject"
          )?.value || "",
        },
      });

      results.push({
        messageId: message.id,
        transactionReference: parsed.transactionReference,
        amount: parsed.amount,
        result: reconciliation.result,
        paymentId: reconciliation.paymentId || null,
        orderId: reconciliation.orderId || null,
        message: reconciliation.message || "",
      });
    } catch (error) {
      console.error(`Gmail payment reconciliation failed for ${message.id}:`, error.message);
      results.push({
        messageId: message.id,
        result: "error",
        message: String(error.message || "Unable to process Gmail payment alert.").slice(0, 300),
      });
    }
  }

  return {
    enabled: true,
    scanned: results.length,
    matched: results.filter((item) => item.result === "matched").length,
    reviewRequired: results.filter((item) => item.result === "review_required").length,
    skipped: results.filter((item) => item.result === "skipped" || item.result === "already_processed").length,
    results,
  };
}

export function startAutomatedGmailReconciliation() {
  if (
    process.env.ENABLE_GMAIL_RECONCILIATION !== "true" ||
    !String(process.env.GMAIL_REFRESH_TOKEN || "").trim()
  ) {
    return null;
  }

  const intervalMinutes = Math.min(
    Math.max(Number(process.env.GMAIL_RECONCILIATION_INTERVAL_MINUTES || 5), 1),
    60
  );

  const run = () => {
    reconcileMoniepointCreditEmails().catch((error) => {
      console.error("Automated Gmail payment reconciliation failed:", error.message);
    });
  };

  run();
  return setInterval(run, intervalMinutes * 60 * 1000);
}
