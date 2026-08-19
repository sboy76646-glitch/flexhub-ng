import express from "express";

import {
  configurePayoutAccount,
  getSellerPayouts,
  listAdminPayouts,
  listBanks,
  processAdminPayouts,
  retryAdminPayout,
} from "../controllers/payoutController.js";
import {
  requireAdmin,
  requireApprovedSeller,
  requireAuth,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/seller", requireAuth, requireApprovedSeller, getSellerPayouts);
router.get("/seller/banks", requireAuth, requireApprovedSeller, listBanks);
router.post("/seller/account", requireAuth, requireApprovedSeller, configurePayoutAccount);
router.get("/admin", requireAuth, requireAdmin, listAdminPayouts);
router.post("/admin/process", requireAuth, requireAdmin, processAdminPayouts);
router.post("/admin/:payoutId/retry", requireAuth, requireAdmin, retryAdminPayout);

export default router;
