function normalizeText(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .trim();
}

function parseAmount(value) {
  const cleaned = String(value || "")
    .replace(/[₦N,\s]/gi, "")
    .trim();

  const amount = Number(cleaned);

  return Number.isFinite(amount) ? amount : null;
}

function parseMoniepointCreditEmail(body) {
  const text = normalizeText(body);

  if (!/credit transaction occurred/i.test(text)) {
    return null;
  }

  const creditMatch = text.match(
    /Credit Amount\s*([\d,]+(?:\.\d{1,2})?)/i
  );

  const senderMatch = text.match(
    /Sender's Name:\s*from\s+([^\r\n]+)/i
  );

  const dateMatch = text.match(
    /Date\s*&\s*Time:\s*([^\r\n]+)/i
  );

  const narrationMatch = text.match(
    /Narration:\s*([^\r\n]+)/i
  );

  const amount = creditMatch
    ? parseAmount(creditMatch[1])
    : null;

  const senderName = senderMatch
    ? senderMatch[1].trim()
    : "";

  const transactionDate = dateMatch
    ? dateMatch[1].trim()
    : "";

  const narration = narrationMatch
    ? narrationMatch[1].trim()
    : "";

  if (amount === null) {
    return null;
  }

  return {
    type: "credit",
    amount,
    currency: "NGN",
    senderName,
    transactionDate,
    narration,
    transactionReference: extractFlexHubReference(
      narration
    ),
  };
}

function extractFlexHubReference(text) {
  const match = String(text || "").match(
    /\bFH-\d{4}-[A-Z0-9]{12}\b/i
  );

  return match ? match[0].toUpperCase() : "";
}

export {
  parseMoniepointCreditEmail,
  extractFlexHubReference,
};