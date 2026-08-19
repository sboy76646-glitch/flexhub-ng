import Notification from "../models/Notification.js";

export async function createNotification({ recipient, type = "system", title, message, link = "", metadata = {} }) {
  if (!recipient || !title || !message) return null;
  return Notification.create({ recipient, type, title, message, link, metadata });
}

export async function createNotifications(entries = []) {
  const valid = entries.filter((entry) => entry?.recipient && entry?.title && entry?.message);
  if (valid.length === 0) return [];
  return Notification.insertMany(valid, { ordered: false });
}
