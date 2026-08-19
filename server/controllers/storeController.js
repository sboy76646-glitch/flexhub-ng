import mongoose from "mongoose";

import Store from "../models/Store.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { buildSellerTrust } from "../services/trustService.js";

async function addTrustProfiles(stores) {
  if (stores.length === 0) return [];

  const storeIds = stores.map((store) => store._id);
  const rows = await Product.aggregate([
    { $match: { store: { $in: storeIds }, status: "approved" } },
    {
      $group: {
        _id: "$store",
        total: { $sum: 1 },
        verified: {
          $sum: { $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0] },
        },
      },
    },
  ]);
  const rates = new Map(rows.map((row) => [
    String(row._id),
    row.total > 0 ? (row.verified / row.total) * 100 : 0,
  ]));

  return stores.map((store) => ({
    ...store,
    sellerTrust: buildSellerTrust(store, rates.get(String(store._id)) || 0),
  }));
}

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listStores(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(30, Math.max(6, Number.parseInt(req.query.limit, 10) || 18));
  const skip = (page - 1) * limit;
  const query = { status: "approved", verified: true };

  if (req.query.q) {
    const safeQuery = String(req.query.q).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: safeQuery, $options: "i" } },
      { category: { $regex: safeQuery, $options: "i" } },
      { location: { $regex: safeQuery, $options: "i" } },
    ];
  }

  const [stores, total] = await Promise.all([
    Store.find(query)
      .select(
        "name slug category location description verified verificationLevel verificationChecks performance createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Store.countDocuments(query),
  ]);

  const pages = total === 0 ? 0 : Math.ceil(total / limit);
  res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");

  return res.json({
    success: true,
    stores: await addTrustProfiles(stores),
    pagination: { page, limit, total, pages, hasMore: page < pages },
  });
}

export async function getMyStore(req, res) {
  const store = await Store.findOne({
    owner: req.user._id,
  }).select("-reviewedBy -payout.recipientCode");

  return res.json({
    success: true,
    store,
  });
}

export async function getPublicStore(req, res) {
  const store = await Store.findOne({
    slug: req.params.slug,
    status: "approved",
    verified: true,
  }).select(
    "name slug category location description verified verificationLevel verificationChecks performance createdAt"
  ).lean();

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found.",
    });
  }

  return res.json({
    success: true,
    store: (await addTrustProfiles([store]))[0],
  });
}

export async function listStoreApplications(req, res) {
  const stores = await Store.find({
    status: "pending",
  })
    .populate(
      "owner",
      "firstName lastName email phone"
    )
    .sort({ createdAt: 1 });

  return res.json({
    success: true,
    stores,
  });
}

export async function listAdminStores(req, res) {
  const stores = await Store.find()
    .populate(
      "owner",
      "firstName lastName email phone"
    )
    .select("-payout.recipientCode")
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    stores,
  });
}

export async function updateStoreCommission(req, res) {
  if (!mongoose.isValidObjectId(req.params.storeId)) {
    return res.status(404).json({
      success: false,
      message: "Store not found.",
    });
  }

  const ratePercent = Number(req.body.ratePercent);

  if (
    !Number.isFinite(ratePercent) ||
    ratePercent < 0 ||
    ratePercent > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Commission must be between 0% and 100%.",
    });
  }

  const commissionRateBps = Math.round(
    ratePercent * 100
  );

  const store = await Store.findByIdAndUpdate(
    req.params.storeId,
    {
      commissionRateBps,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("name slug commissionRateBps");

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store not found.",
    });
  }

  return res.json({
    success: true,
    message: `${store.name}'s commission is now ${
      commissionRateBps / 100
    }%. New orders will use this rate.`,
    store,
  });
}

export async function updateStoreVerification(req, res) {
  if (!mongoose.isValidObjectId(req.params.storeId)) {
    return res.status(404).json({ success: false, message: "Store not found." });
  }

  const store = await Store.findById(req.params.storeId);
  if (!store) {
    return res.status(404).json({ success: false, message: "Store not found." });
  }

  if (store.status !== "approved") {
    return res.status(409).json({
      success: false,
      message: "Approve the store before recording seller verification checks.",
    });
  }

  const checks = ["email", "phone", "identity", "address", "business", "physicalInspection"];
  checks.forEach((check) => {
    store.verificationChecks[check] = req.body[check] === true;
  });

  store.verificationLevel = store.verificationChecks.identity && store.verificationChecks.address
    ? "verified"
    : "basic";
  await store.save();

  return res.json({
    success: true,
    message: `${store.name}'s verification evidence has been updated.`,
    store,
  });
}

export async function reviewStoreApplication(req, res) {
  const { decision, note = "" } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Choose approve or reject.",
    });
  }

  if (!mongoose.isValidObjectId(req.params.storeId)) {
    return res.status(404).json({
      success: false,
      message: "Store application not found.",
    });
  }

  const store = await Store.findById(
    req.params.storeId
  );

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "Store application not found.",
    });
  }

  if (store.status !== "pending") {
    return res.status(409).json({
      success: false,
      message: "This application has already been reviewed.",
    });
  }

  store.status = decision;
  store.verified = decision === "approved";
  store.reviewNote = String(note).trim();
  store.reviewedAt = new Date();
  store.reviewedBy = req.user._id;

  await store.save();

  await User.findByIdAndUpdate(store.owner, {
    role:
      decision === "approved"
        ? "seller"
        : "customer",
  });

  return res.json({
    success: true,
    message:
      decision === "approved"
        ? "Mini-store approved and published."
        : "Mini-store application rejected.",
    store: {
      id: store._id,
      name: store.name,
      slug: store.slug,
      status: store.status,
      verified: store.verified,
      reviewNote: store.reviewNote,
    },
  });
}

export async function applyForStore(req, res) {
  try {
    const {
      name,
      category,
      location,
      description,
    } = req.body;

    const cleanedName = String(name || "").trim();
    const cleanedCategory = String(
      category || ""
    ).trim();
    const cleanedLocation = String(
      location || ""
    ).trim();
    const cleanedDescription = String(
      description || ""
    ).trim();

    if (
      !cleanedName ||
      !cleanedCategory ||
      !cleanedLocation ||
      !cleanedDescription
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all store details.",
      });
    }

    if (cleanedName.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Store name is too long.",
      });
    }

    if (cleanedCategory.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Store category is too long.",
      });
    }

    if (cleanedLocation.length > 80) {
      return res.status(400).json({
        success: false,
        message: "Store location is too long.",
      });
    }

    if (cleanedDescription.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Store description is too long.",
      });
    }

    const existing = await Store.findOne({
      owner: req.user._id,
    });

    if (
      existing &&
      existing.status !== "rejected"
    ) {
      return res.status(409).json({
        success: false,
        message:
          existing.status === "approved"
            ? "This account already has an approved store."
            : "This account already has a store application under review.",
      });
    }

    const baseSlug =
      createSlug(cleanedName) ||
      `store-${Date.now()}`;

    if (existing?.status === "rejected") {
      const duplicateSlug = await Store.exists({
        slug: baseSlug,
        _id: {
          $ne: existing._id,
        },
      });

      existing.name = cleanedName;
      existing.slug = duplicateSlug
        ? `${baseSlug}-${Date.now()
            .toString()
            .slice(-6)}`
        : baseSlug;
      existing.category = cleanedCategory;
      existing.location = cleanedLocation;
      existing.description =
        cleanedDescription;
      existing.status = "pending";
      existing.verified = false;
      existing.reviewNote = "";
      existing.reviewedAt = null;
      existing.reviewedBy = null;

      await existing.save();

      await User.findByIdAndUpdate(
        req.user._id,
        {
          role: "seller_pending",
        }
      );

      return res.json({
        success: true,
        message:
          "Your corrected store application has been resubmitted for review.",
        store: {
          id: existing._id,
          name: existing.name,
          slug: existing.slug,
          category: existing.category,
          location: existing.location,
          description: existing.description,
          status: existing.status,
          verified: existing.verified,
        },
      });
    }

    const duplicateSlug = await Store.exists({
      slug: baseSlug,
    });

    const slug = duplicateSlug
      ? `${baseSlug}-${Date.now()
          .toString()
          .slice(-6)}`
      : baseSlug;

    const store = await Store.create({
      owner: req.user._id,
      name: cleanedName,
      slug,
      category: cleanedCategory,
      location: cleanedLocation,
      description: cleanedDescription,
      status: "pending",
      verified: false,
    });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        role: "seller_pending",
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Your mini-store application has been submitted for review.",
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug,
        category: store.category,
        location: store.location,
        description: store.description,
        status: store.status,
        verified: store.verified,
      },
    });
  } catch (error) {
    console.error(
      "Store application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit your application right now.",
    });
  }
} 
export async function suspendStore(req, res) {
  try {
    const { reason = "" } = req.body;

    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    if (store.status === "removed") {
      return res.status(400).json({
        success: false,
        message: "Removed stores cannot be suspended.",
      });
    }

    store.status = "suspended";
    store.verified = false;

    store.suspendedAt = new Date();
    store.suspendedBy = req.user._id;
    store.suspensionReason = reason.trim();

    await store.save();

    await User.findByIdAndUpdate(store.owner, {
      role: "seller_suspended",
    });

    res.json({
      success: true,
      message: "Store suspended successfully.",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to suspend store.",
    });
  }
}
export async function restoreStore(req, res) {

  try {

    const store = await Store.findById(req.params.storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    store.status = "approved";
    store.verified = true;

    store.suspendedAt = null;
    store.suspendedBy = null;
    store.suspensionReason = "";

    await store.save();

    await User.findByIdAndUpdate(store.owner, {
      role: "seller",
    });

    res.json({
      success: true,
      message: "Store restored successfully.",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to restore store.",
    });

  }

}
export async function removeStore(req, res) {

  try {

    const { reason = "" } = req.body;

    const store = await Store.findById(req.params.storeId);

    if (!store) {

      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });

    }

    store.status = "removed";

    store.verified = false;

    store.removedAt = new Date();

    store.removedBy = req.user._id;

    store.removalReason = reason.trim();

    await store.save();

    await Product.updateMany(
      {
        store: store._id,
      },
      {
        status: "archived",
      }
    );

    await User.findByIdAndUpdate(store.owner, {
      role: "customer",
    });

    res.json({
      success: true,
      message: "Seller removed successfully.",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to remove seller.",
    });

  }

} 
