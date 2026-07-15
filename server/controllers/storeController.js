import Store from "../models/Store.js";
import User from "../models/User.js";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listStores(req, res) {
  try {
    const stores = await Store.find({ status: "approved" })
      .select("name slug category location description verified createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, stores });
  } catch (error) {
    console.error("Store listing error:", error);
    return res.status(500).json({ success: false, message: "Unable to load stores right now." });
  }
}

export async function getMyStore(req, res) {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .select("name slug category location description status verified createdAt");

    if (!store) {
      return res.status(404).json({ success: false, message: "No mini-store application found." });
    }

    return res.json({
      success: true,
      store: {
        id: store._id,
        name: store.name,
        slug: store.slug,
        category: store.category,
        location: store.location,
        description: store.description,
        status: store.status,
        verified: store.verified,
        createdAt: store.createdAt,
      },
    });
  } catch (error) {
    console.error("Seller store lookup error:", error);
    return res.status(500).json({ success: false, message: "Unable to load your mini-store right now." });
  }
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
