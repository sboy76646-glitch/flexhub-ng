import mongoose from "mongoose";
import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({ recipient: req.user._id, readAt: null }),
  ]);
  return res.json({ success: true, notifications, unreadCount });
}

export async function markNotificationRead(req, res) {
  if (!mongoose.isValidObjectId(req.params.notificationId)) {
    return res.status(404).json({ success: false, message: "Notification not found." });
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, recipient: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
  return res.json({ success: true, notification });
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return res.json({ success: true, message: "All notifications marked as read." });
}
