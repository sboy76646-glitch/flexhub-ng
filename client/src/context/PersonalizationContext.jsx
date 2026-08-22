import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "./AuthContext";

const PersonalizationContext = createContext(null);
const MAX_VIEWED = 8;
const MAX_SEARCHES = 8;
const MAX_INTERESTS = 12;
const GUEST_KEY = "guest";

function emptyProfile() {
  return {
    viewedProducts: [],
    recentSearches: [],
    categories: {},
    brands: {},
    priceSamples: [],
  };
}

function getStorageKey(user) {
  const identity = user?._id || user?.id || user?.email || GUEST_KEY;
  return `flexhub-personalization:${String(identity).toLowerCase()}`;
}

function readProfile(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw);
    const fallback = emptyProfile();
    return {
      ...fallback,
      ...parsed,
      viewedProducts: Array.isArray(parsed.viewedProducts) ? parsed.viewedProducts : fallback.viewedProducts,
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : fallback.recentSearches,
      categories: parsed.categories && typeof parsed.categories === "object" ? parsed.categories : fallback.categories,
      brands: parsed.brands && typeof parsed.brands === "object" ? parsed.brands : fallback.brands,
      priceSamples: Array.isArray(parsed.priceSamples) ? parsed.priceSamples : fallback.priceSamples,
    };
  } catch {
    return emptyProfile();
  }
}

function saveProfile(key, profile) {
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    // Personalization is optional; storage failures must never break shopping.
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function scoreProduct(product, profile, query = "") {
  if (!product) return -Infinity;

  const category = normalize(product.category);
  const brand = normalize(product.brand);
  const name = normalize(product.name);
  const price = Number(product.price || 0);
  const queryText = normalize(query);
  let score = 0;

  if (category && profile.categories[product.category]) {
    score += Math.min(40, Number(profile.categories[product.category]) * 8);
  }

  if (brand && profile.brands[product.brand]) {
    score += Math.min(25, Number(profile.brands[product.brand]) * 10);
  }

  if (queryText) {
    const terms = queryText.split(/\s+/).filter(Boolean);
    score += terms.reduce((total, term) => total + (name.includes(term) ? 18 : 0), 0);
    if (category.includes(queryText)) score += 15;
    if (brand.includes(queryText)) score += 15;
  }

  if (profile.priceSamples.length && price > 0) {
    const averagePrice = profile.priceSamples.reduce((sum, value) => sum + Number(value || 0), 0) / profile.priceSamples.length;
    if (averagePrice > 0) {
      const distance = Math.abs(price - averagePrice) / averagePrice;
      score += Math.max(0, 20 - distance * 20);
    }
  }

  const viewedIndex = profile.viewedProducts.findIndex((item) => String(item.id) === String(product.id || product._id));
  if (viewedIndex >= 0) score -= 50;

  return score;
}

export function rankProducts(products = [], profile, query = "") {
  if (!Array.isArray(products)) return [];
  const activeProfile = profile || emptyProfile();
  return [...products]
    .map((product, index) => ({ product, index, score: scoreProduct(product, activeProfile, query) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ product }) => product);
}

export function PersonalizationProvider({ children }) {
  const { user } = useAuth();
  const storageKey = getStorageKey(user);
  const [profile, setProfile] = useState(() => readProfile(storageKey));

  useEffect(() => {
    setProfile(readProfile(storageKey));
  }, [storageKey]);

  const updateProfile = useCallback((updater) => {
    setProfile((current) => {
      const next = updater(current);
      saveProfile(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const recordProductView = useCallback((product) => {
    if (!product?.id && !product?._id) return;

    const productId = String(product.id || product._id);
    const categoryName = String(product.category || "").trim();
    const brandName = String(product.brand || "").trim();
    const price = Number(product.price || 0);
    const snapshot = {
      id: productId,
      name: product.name || "Product",
      image: product.image || "",
      price,
      category: categoryName,
      brand: brandName,
      viewedAt: Date.now(),
    };

    updateProfile((current) => {
      const viewedProducts = [
        snapshot,
        ...current.viewedProducts.filter((item) => String(item.id) !== productId),
      ].slice(0, MAX_VIEWED);

      const categories = { ...current.categories };
      if (categoryName) categories[categoryName] = Number(categories[categoryName] || 0) + 1;

      const brands = { ...current.brands };
      if (brandName) brands[brandName] = Number(brands[brandName] || 0) + 1;

      const priceSamples = price > 0
        ? [price, ...current.priceSamples.map(Number)].filter(Boolean).slice(0, MAX_INTERESTS)
        : current.priceSamples;

      return { ...current, viewedProducts, categories, brands, priceSamples };
    });
  }, [updateProfile]);

  const recordSearch = useCallback((query) => {
    const normalized = String(query || "").trim();
    if (!normalized) return;

    updateProfile((current) => ({
      ...current,
      recentSearches: [
        normalized,
        ...current.recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
      ].slice(0, MAX_SEARCHES),
    }));
  }, [updateProfile]);

  const clearPersonalization = useCallback(() => {
    const empty = emptyProfile();
    saveProfile(storageKey, empty);
    setProfile(empty);
  }, [storageKey]);

  const favoriteCategories = useMemo(
    () => Object.entries(profile.categories)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category)
      .slice(0, 5),
    [profile.categories]
  );

  const favoriteBrands = useMemo(
    () => Object.entries(profile.brands)
      .sort(([, a], [, b]) => b - a)
      .map(([brand]) => brand)
      .slice(0, 5),
    [profile.brands]
  );

  const averagePrice = useMemo(() => {
    if (!profile.priceSamples.length) return 0;
    return profile.priceSamples.reduce((sum, value) => sum + Number(value || 0), 0) / profile.priceSamples.length;
  }, [profile.priceSamples]);

  const value = useMemo(() => ({
    ...profile,
    favoriteCategories,
    favoriteBrands,
    averagePrice,
    rankProducts: (products, query) => rankProducts(products, profile, query),
    recordProductView,
    recordSearch,
    clearPersonalization,
  }), [profile, favoriteCategories, favoriteBrands, averagePrice, recordProductView, recordSearch, clearPersonalization]);

  return <PersonalizationContext.Provider value={value}>{children}</PersonalizationContext.Provider>;
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) throw new Error("usePersonalization must be used inside PersonalizationProvider.");
  return context;
}
