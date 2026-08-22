import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useAuth } from "./AuthContext";

const PersonalizationContext = createContext(null);
const MAX_VIEWED = 8;
const MAX_SEARCHES = 8;
const GUEST_KEY = "guest";

function getStorageKey(user) {
  const identity = user?._id || user?.id || user?.email || GUEST_KEY;
  return `flexhub-personalization:${String(identity).toLowerCase()}`;
}

function readProfile(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { viewedProducts: [], recentSearches: [], categories: {} };
    const parsed = JSON.parse(raw);
    return {
      viewedProducts: Array.isArray(parsed.viewedProducts) ? parsed.viewedProducts : [],
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
      categories: parsed.categories && typeof parsed.categories === "object" ? parsed.categories : {},
    };
  } catch {
    return { viewedProducts: [], recentSearches: [], categories: {} };
  }
}

function saveProfile(key, profile) {
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch {
    // Personalization is optional; storage failures must never break shopping.
  }
}

export function PersonalizationProvider({ children }) {
  const { user } = useAuth();
  const storageKey = getStorageKey(user);
  const [profile, setProfile] = useState(() => readProfile(storageKey));

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
    const category = String(product.category || "").trim();
    const snapshot = {
      id: productId,
      name: product.name || "Product",
      image: product.image || "",
      price: Number(product.price || 0),
      category,
      viewedAt: Date.now(),
    };

    updateProfile((current) => {
      const viewedProducts = [
        snapshot,
        ...current.viewedProducts.filter((item) => String(item.id) !== productId),
      ].slice(0, MAX_VIEWED);

      const categories = { ...current.categories };
      if (category) categories[category] = Number(categories[category] || 0) + 1;

      return { ...current, viewedProducts, categories };
    });
  }, [updateProfile]);

  const recordSearch = useCallback((query) => {
    const normalized = String(query || "").trim();
    if (!normalized) return;

    updateProfile((current) => ({
      ...current,
      recentSearches: [
        normalized,
        ...current.recentSearches.filter(
          (item) => item.toLowerCase() !== normalized.toLowerCase()
        ),
      ].slice(0, MAX_SEARCHES),
    }));
  }, [updateProfile]);

  const clearPersonalization = useCallback(() => {
    const empty = { viewedProducts: [], recentSearches: [], categories: {} };
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

  const value = useMemo(() => ({
    ...profile,
    favoriteCategories,
    recordProductView,
    recordSearch,
    clearPersonalization,
  }), [profile, favoriteCategories, recordProductView, recordSearch, clearPersonalization]);

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error("usePersonalization must be used inside PersonalizationProvider.");
  }
  return context;
}
