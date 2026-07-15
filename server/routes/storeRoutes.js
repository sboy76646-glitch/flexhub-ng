import express from "express";
import { applyForStore, getMyStore, listStores } from "../controllers/storeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listStores);
router.get("/me", requireAuth, getMyStore);
router.post("/apply", requireAuth, applyForStore);

export default router;
