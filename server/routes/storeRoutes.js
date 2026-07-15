import express from "express";
import {
  applyForStore,
  getMyStore,
  getPublicStore,
  listAdminStores,
  listStoreApplications,
  listStores,
  reviewStoreApplication,
  updateStoreCommission,
} from "../controllers/storeController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listStores);
router.get("/mine", requireAuth, getMyStore);
router.get("/admin/applications", requireAuth, requireAdmin, listStoreApplications);
router.patch("/admin/applications/:storeId", requireAuth, requireAdmin, reviewStoreApplication);
router.get("/admin/all", requireAuth, requireAdmin, listAdminStores);
router.patch("/admin/:storeId/commission", requireAuth, requireAdmin, updateStoreCommission);
router.get("/:slug", getPublicStore);
router.post("/apply", requireAuth, applyForStore);

export default router;
