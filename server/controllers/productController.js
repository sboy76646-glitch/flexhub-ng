import Product from "../models/Product.js";
import Store from "../models/Store.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatProduct(product) {
  const store = product.store && typeof product.store === "object" ? product.store : null;

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    description: product.description,
    image: product.image,
    status: product.status,
    rating: product.rating,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt,
    store: store
      ? {
          id: store._id,
          name: store.name,
          slug: store.slug,
          verified: store.verified,
        }
      : undefined,
  };
}

function validateCloudinaryImage(image) {
  if (!image?.url?.trim() || !image?.publicId?.trim()) {
    return "Upload a product image before saving the draft.";
  }

  try {
    const imageUrl = new URL(image.url);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "l4mrjyfd";
    const pathStartsWithCloudName = imageUrl.pathname.startsWith(`/${cloudName}/`);

    if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "res.cloudinary.com" || !pathStartsWithCloudName) {
      return "The product image must come from the platform image account.";
    }
  } catch {
    return "The product image address is invalid.";
  }

  if (!ALLOWED_IMAGE_FORMATS.has(String(image.format || "").toLowerCase())) {
    return "Use a JPG, PNG or WebP product image.";
  }

  const bytes = Number(image.bytes);
  if (!Number.isFinite(bytes) || bytes < 1 || bytes > MAX_IMAGE_BYTES) {
    return "The product image must be 5 MB or smaller.";
  }

  return "";
}

export async function listApprovedProducts(req, res) {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("store", "name slug verified")
      .sort({ createdAt: -1 });

    return res.json({ success: true, products: products.map(formatProduct) });
  } catch (error) {
    console.error("Product listing error:", error);
    return res.status(500).json({ success: false, message: "Unable to load products right now." });
  }
}

export async function listMyProducts(req, res) {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate("store", "name slug verified")
      .sort({ createdAt: -1 });

    return res.json({ success: true, products: products.map(formatProduct) });
  } catch (error) {
    console.error("Seller product listing error:", error);
    return res.status(500).json({ success: false, message: "Unable to load your product drafts right now." });
  }
}

export async function createProductDraft(req, res) {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(403).json({ success: false, message: "Apply for a mini-store before adding products." });
    }

    const { name, category, price, oldPrice, stock, description, image } = req.body;
    const textFields = [name, category, description];
    if (!textFields.every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ success: false, message: "Complete the product name, category and description." });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericOldPrice = oldPrice === null || oldPrice === "" || oldPrice === undefined ? null : Number(oldPrice);

    if (!Number.isFinite(numericPrice) || numericPrice < 1) {
      return res.status(400).json({ success: false, message: "Enter a valid selling price." });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0 || numericStock > 100000) {
      return res.status(400).json({ success: false, message: "Enter a valid whole-number stock quantity." });
    }

    if (numericOldPrice !== null && (!Number.isFinite(numericOldPrice) || numericOldPrice < 1)) {
      return res.status(400).json({ success: false, message: "Enter a valid previous price or leave it blank." });
    }

    const imageError = validateCloudinaryImage(image);
    if (imageError) {
      return res.status(400).json({ success: false, message: imageError });
    }

    const baseSlug = createSlug(name) || "product";
    const slug = `${baseSlug}-${Date.now().toString().slice(-8)}`;
    const product = await Product.create({
      seller: req.user._id,
      store: store._id,
      name: name.trim(),
      slug,
      category: category.trim(),
      price: numericPrice,
      oldPrice: numericOldPrice,
      stock: numericStock,
      description: description.trim(),
      image: {
        url: image.url.trim(),
        publicId: image.publicId.trim(),
        width: Number(image.width),
        height: Number(image.height),
        format: String(image.format).toLowerCase(),
        bytes: Number(image.bytes),
      },
    });

    await product.populate("store", "name slug verified");

    return res.status(201).json({
      success: true,
      message: "Product draft saved.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("Product draft error:", error);
    return res.status(500).json({ success: false, message: "Unable to save this product draft right now." });
  }
}
