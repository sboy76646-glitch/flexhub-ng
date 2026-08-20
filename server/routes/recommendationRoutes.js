import express from "express";

import {
  getRecommendations,
  recordProductInteraction,
} from "../controllers/recommendationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getRecommendations);
router.post("/interactions", requireAuth, recordProductInteraction);

export default router;
