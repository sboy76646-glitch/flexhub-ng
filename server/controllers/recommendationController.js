import Product from "../models/Product.js";
import ProductInteraction from "../models/ProductInteraction.js";
import Review from "../models/Review.js";
import Store from "../models/Store.js";

function uniqueProducts(products, limit = 5) {
  const seen = new Set();
  return products.filter((product) => {
    const id = String(product._id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit);
}

function publicProduct(product, rating = 0, reviewCount = 0) {
  return {
    id: product._id,
    name: product.name,
    category: product.category,
    image: product.imageUrl,
    price: product.price,
    oldPrice: product.oldPrice,
    stock: product.stock,
    rating,
    reviewCount,
    storeName: product.store?.name || "FlexHub seller",
    storeLocation: product.store?.location || "Nigeria",
  };
}

async function loadProducts(query, limit = 20) {
  return Product.find({
    status: "approved",
    stock: { $gt: 0 },
    ...query,
  })
    .populate("store", "name location")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function ratingMap(products) {
  if (!products.length) return new Map();
  const ids = products.map((product) => product._id);
  const rows = await Review.aggregate([
    { $match: { product: { $in: ids }, status: "published" } },
    { $group: { _id: "$product", rating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row]));
}

export async function recordProductInteraction(req, res) {
  const { productId, type = "view" } = req.body || {};
  if (!["view", "cart", "wishlist", "purchase"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid interaction type." });
  }

  const exists = await Product.exists({ _id: productId, status: "approved" });
  if (!exists) return res.status(404).json({ success: false, message: "Product not found." });

  await ProductInteraction.create({ user: req.user._id, product: productId, type });
  return res.status(201).json({ success: true });
}

export async function getRecommendations(req, res) {
  const interactions = await ProductInteraction.find({ user: req.user._id, type: "view" })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("product", "category")
    .lean();

  const recentIds = interactions.map((item) => item.product?._id).filter(Boolean);
  const categoryWeights = new Map();
  interactions.forEach((item, index) => {
    const category = item.product?.category;
    if (category) categoryWeights.set(category, (categoryWeights.get(category) || 0) + Math.max(1, 30 - index));
  });
  const preferredCategories = [...categoryWeights.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category).slice(0, 5);

  const recent = recentIds.length
    ? await Product.find({ _id: { $in: recentIds }, status: "approved" }).populate("store", "name location").lean()
    : [];

  const recommended = preferredCategories.length
    ? await loadProducts({ category: { $in: preferredCategories }, _id: { $nin: recentIds } }, 25)
    : await loadProducts({}, 25);

  const trendingSince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const trendingRows = await ProductInteraction.aggregate([
    { $match: { type: { $in: ["view", "cart", "purchase"] }, createdAt: { $gte: trendingSince } } },
    { $group: { _id: "$product", score: { $sum: { $cond: [{ $eq: ["$type", "purchase"] }, 5, { $cond: [{ $eq: ["$type", "cart"] }, 3, 1] }] } } } },
    { $sort: { score: -1 } },
    { $limit: 20 },
  ]);
  const trendingIds = trendingRows.map((row) => row._id);
  const trending = trendingIds.length
    ? await Product.find({ _id: { $in: trendingIds }, status: "approved", stock: { $gt: 0 } }).populate("store", "name location").lean()
    : await loadProducts({}, 25);

  const user = req.user;
  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const preferredAddress = addresses.find((address) => address.city || address.state) || {};
  const locationTerms = [preferredAddress.city, preferredAddress.state].filter(Boolean).map((value) => String(value).trim());
  let popularNearYou = [];
  if (locationTerms.length) {
    const locationRegex = new RegExp(locationTerms.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
    const nearbyStores = await Store.find({ status: "approved", verified: true, location: locationRegex }).distinct("_id");
    popularNearYou = nearbyStores.length ? await loadProducts({ store: { $in: nearbyStores } }, 20) : [];
  }
  if (!popularNearYou.length) popularNearYou = trending.slice(0, 20);

  const newest = await Product.find({ status: "approved", stock: { $gt: 0 } })
    .populate("store", "name location")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const becauseYouViewed = preferredCategories.length
    ? await loadProducts({ category: preferredCategories[0], _id: { $nin: recentIds } }, 20)
    : [];

  const alsoLike = await loadProducts({ _id: { $nin: [...recentIds, ...recommended.map((p) => p._id)] } }, 20);

  const all = [...recommended, ...trending, ...recent, ...popularNearYou, ...newest, ...becauseYouViewed, ...alsoLike];
  const ratings = await ratingMap(all);
  const mapSection = (items) => uniqueProducts(items, 5).map((product) => {
    const row = ratings.get(String(product._id));
    return publicProduct(product, row?.rating ? Number(row.rating.toFixed(1)) : null, row?.count || 0);
  });

  return res.json({
    success: true,
    location: preferredAddress.city || preferredAddress.state || "",
    sections: {
      recommended: mapSection(recommended),
      trending: mapSection(trending),
      recentlyViewed: mapSection(recent),
      popularNearYou: mapSection(popularNearYou),
      newest: mapSection(newest),
      becauseYouViewed: mapSection(becauseYouViewed),
      alsoLike: mapSection(alsoLike),
    },
  });
}
