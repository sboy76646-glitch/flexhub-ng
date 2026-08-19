import dotenv from "dotenv";
import { createAuthenticatedGmailClient } from "../services/gmailService.js";

dotenv.config();

function decodeBase64Url(value = "") {
  return Buffer.from(
    value.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  ).toString("utf8");
}

function findBody(payload) {
  if (!payload) return "";

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  for (const part of payload.parts || []) {
    const result = findBody(part);

    if (result) {
      return result;
    }
  }

  return "";
}

function redactSensitiveData(text) {
  return text
    // Email addresses
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[EMAIL]"
    )

    // Nigerian phone numbers
    .replace(
      /(?:\+234|0)8\d{9}\b/g,
      "[PHONE]"
    )

    // Long account/card numbers
    .replace(
      /\b\d{10,19}\b/g,
      "[NUMBER]"
    )

    // Nigerian currency amounts — preserve amount structure
    .replace(
      /(?:₦|NGN)\s?[\d,]+(?:\.\d{2})?/gi,
      "[AMOUNT]"
    );
}

async function main() {
  const gmail = createAuthenticatedGmailClient(
    process.env.GOOGLE_REFRESH_TOKEN
  );

  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
    q: process.env.GMAIL_TRANSACTION_SEARCH_QUERY ||
      "from:(no-reply@moniepoint.com) newer_than:7d",
  });

  const messages = response.data.messages || [];

  console.log(`Found ${messages.length} Moniepoint message(s).\n`);

  for (const message of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
      format: "full",
    });

    const headers = detail.data.payload?.headers || [];

    const getHeader = (name) =>
      headers.find(
        (header) =>
          header.name.toLowerCase() === name.toLowerCase()
      )?.value || "";

    const subject = getHeader("Subject");
    const from = getHeader("From");
    const date = getHeader("Date");

    const body = findBody(detail.data.payload);

    console.log("========================================");
    console.log(`ID: ${message.id}`);
    console.log(`FROM: ${from}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`DATE: ${date}`);
    console.log("----------------------------------------");
    console.log(redactSensitiveData(body));
    console.log("========================================\n");
  }
}

main().catch((error) => {
  console.error("Gmail test failed:", error.message);
  process.exit(1);
});