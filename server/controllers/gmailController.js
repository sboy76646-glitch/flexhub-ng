import {
  exchangeGmailAuthorizationCode,
  getGmailAuthorizationUrl,
} from "../services/gmailService.js";

export function startGmailOAuth(req, res) {
  try {
    const url = getGmailAuthorizationUrl();

    return res.redirect(url);
  } catch (error) {
    console.error("Gmail OAuth start error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function handleGmailOAuthCallback(req, res) {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: `Google authorization failed: ${error}`,
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Google authorization code was not provided.",
      });
    }

    const tokens = await exchangeGmailAuthorizationCode(code);

    if (!tokens.refresh_token) {
      return res.status(400).json({
        success: false,
        message:
          "Google did not return a refresh token. Revoke the previous authorization and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Gmail authorization successful. Save the refresh token securely.",
      refreshToken: tokens.refresh_token,
    });
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}