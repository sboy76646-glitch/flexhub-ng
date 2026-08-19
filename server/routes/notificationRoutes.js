import express from "express";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", requireAuth, listNotifications);
router.patch("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:notificationId/read", requireAuth, markNotificationRead);
export default router;
