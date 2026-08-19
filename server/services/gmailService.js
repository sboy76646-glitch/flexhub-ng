import { google } from "googleapis";

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    const error = new Error(`${name} is not configured.`);
    error.code = "GMAIL_NOT_CONFIGURED";
    throw error;
  }

  return value;
}

export function gmailConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
    process.env.GOOGLE_CLIENT_SECRET?.trim() &&
    process.env.GOOGLE_REDIRECT_URI?.trim()
  );
}

function createOAuthClient() {
  return new google.auth.OAuth2(
    requiredEnv("GOOGLE_CLIENT_ID"),
    requiredEnv("GOOGLE_CLIENT_SECRET"),
    requiredEnv("GOOGLE_REDIRECT_URI")
  );
}

export function getGmailAuthorizationUrl() {
  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
}

export async function exchangeGmailAuthorizationCode(code) {
  if (!code) {
    throw new Error("Google authorization code is required.");
  }

  const oauth2Client = createOAuthClient();

  const { tokens } = await oauth2Client.getToken(code);

  return tokens;
}

export function createAuthenticatedGmailClient(refreshToken) {
  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}