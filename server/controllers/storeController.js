import Store from "../models/Store.js";
import User from "../models/User.js";
import mongoose from "mongoose";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listStores(req, res) {
  const stores = await Store.find({ status: "approved" })
    .select("name slug category location description verified createdAt")
    .sort({ createdAt: -1 });

  return res.json({ success: true, stores });
}

export async function getMyStore(req, res) {
  const store = await Store.findOne({ owner: req.user._id }).select("-reviewedBy -payout.recipientCode");
  return res.json({ success: true, store });
}

export async function getPublicStore(req, res) {
  const store = await Store.findOne({ slug: req.params.slug, status: "approved" })
    .select("name slug category location description verified createdAt");

  if (!store) {
    return res.status(404).json({ success: false, message: "Store not found." });
  }

  return res.json({ success: true, store });
}

export async function listStoreApplications(req, res) {
  const stores = await Store.find({ status: "pending" })
    .populate("owner", "firstName lastName email phone")
    .sort({ createdAt: 1 });

  return res.json({ success: true, stores });
}

export async function listAdminStores(req, res) {
  const stores = await Store.find()
    .populate("owner", "firstName lastName email phone")
    .select("-payout.recipientCode")
    .sort({ createdAt: -1 });

  return res.json({ success: true, stores });
}

export async function updateStoreCommission(req, res) {
  if (!mongoose.isValidObjectId(req.params.storeId)) {
    return res.status(404).json({ success: false, message: "Store not found." });
  }

  const ratePercent = Number(req.body.ratePercent);

  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    return res.status(400).json({ success: false, message: "Commission must be between 0% and 100%." });
  }

  const commissionRateBps = Math.round(ratePercent * 100);
  const store = await Store.findByIdAndUpdate(
    req.params.storeId,
    { commissionRateBps },
    { new: true, runValidators: true }
  ).select("name slug commissionRateBps");

  if (!store) {
    return res.status(404).json({ success: false, message: "Store not found." });
  }

  return res.json({
    success: true,
    message: `${store.name}'s commission is now ${commissionRateBps / 100}%. New orders will use this rate.`,
    store,
  });
}

export async function reviewStoreApplication(req, res) {
  const { decision, note = "" } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ success: false, message: "Choose approve or reject." });
  }

  const store = await Store.findById(req.params.storeId);
  if (!store) {
    return res.status(404).json({ success: false, message: "Store application not found." });
  }

  if (store.status !== "pending") {
    return res.status(409).json({ success: false, message: "This application has already been reviewed." });
  }

  store.status = decision;
  store.verified = decision === "approved";
  store.reviewNote = note.trim();
  store.reviewedAt = new Date();
  store.reviewedBy = req.user._id;
  await store.save();

  await User.findByIdAndUpdate(store.owner, {
    role: decision === "approved" ? "seller" : "customer",
  });

  return res.json({
    success: true,
    message: decision === "approved" ? "Mini-store approved and published." : "Mini-store application rejected.",
    store: { id: store._id, name: store.name, slug: store.slug, status: store.status },
  });
}

export async function applyForStore(req, res) {
  try {
    const { name, category, location, description } = req.body;

    if (![name, category, location, description].every((value) => value?.trim())) {
      return res.status(400).json({ success: false, message: "Please complete all store details." });
    }

    const existing = await Store.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: "This account already has a store application." });
    }

    const baseSlug = createSlug(name);
    const duplicateSlug = await Store.exists({ slug: baseSlug });
    const slug = duplicateSlug ? `${baseSlug}-${Date.now().toString().slice(-6)}` : baseSlug;

    const store = await Store.create({
      owner: req.user._id,
      name: name.trim(),
      slug,
      category: category.trim(),
      location: location.trim(),
      description: description.trim(),
    });

    await User.findByIdAndUpdate(req.user._id, { role: "seller_pending" });

    return res.status(201).json({
      success: true,
      message: "Your mini-store application has been submitted for review.",
      store: { id: store._id, name: store.name, slug: store.slug, status: store.status },
    });
  } catch (error) {
    console.error("Store application error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit your application right now." });
  }
}
