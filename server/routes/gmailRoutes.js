import express from "express";

import {
  handleGmailOAuthCallback,
  startGmailOAuth,
} from "../controllers/gmailController.js";

const router = express.Router();

router.get("/oauth/start", startGmailOAuth);
router.get("/oauth/callback", handleGmailOAuthCallback);

export default router;