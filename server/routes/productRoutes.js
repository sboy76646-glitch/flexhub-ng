import express from "express";

import {
  createProductDraft,
  listApprovedProducts,
  listMyProducts,
} from "../controllers/productController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listApprovedProducts);
router.get("/mine", requireAuth, listMyProducts);
router.post("/drafts", requireAuth, createProductDraft);

export default router;
