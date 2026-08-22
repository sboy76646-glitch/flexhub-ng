import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductGrid from "../components/product/ProductGrid";
import { usePersonalization } from "../context/PersonalizationContext";
import { apiRequest } from "../lib/api";

const PAGE_SIZE = 24;

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const { rankProducts, favoriteCategories } = usePersonalization();

  const selectedCategory = searchParams.get("category") || "All";
  const query = (searchParams.get("q") || "").trim();
  const sortBy = searchParams.get("sort") || "featured";
  const inStock = searchParams.get("stock") === "true";

  const requestKey = useMemo(
    () => JSON.stringify({ selectedCategory, query, sortBy, inStock }),
    [selectedCategory, query, sortBy, inStock]
  );

  const displayedProducts = useMemo(() => {
    if (sortBy !== "featured") return products;
    return rankProducts(products, query);
  }, [products, rankProducts, query, sortBy]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setProducts([]);
      setLoading(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requestKey]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: sortBy });

    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (query) params.set("q", query);
    if (inStock) params.set("inStock", "true");

    const statusTimer = window.setTimeout(() => setLoadError(""), 0);

    apiRequest(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        setProducts((current) => page === 1 ? nextProducts : [...current, ...nextProducts]);
        setCategories(Array.isArray(data.filters?.categories) ? data.filters.categories : []);
        setPagination(data.pagination || { total: nextProducts.length, hasMore: false });
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        setLoadError(error.message || "Unable to load marketplace products.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(statusTimer);
      controller.abort();
    };
  }, [page, requestKey, selectedCategory, query, sortBy, inStock]);

  function updateParam(name, value, defaultValue = "") {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultValue) next.delete(name);
    else next.set(name, value);
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">Marketplace</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Shop products from independent stores</h1>
              <p className="mt-3 text-slate-600">
                {loading ? "Loading products…" : `${pagination.total || 0} result${pagination.total === 1 ? "" : "s"}${query ? ` for “${query}”` : ""}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {sortBy === "featured" && favoriteCategories.length > 0 && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                  Personalized for you
                </span>
              )}
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={inStock} onChange={(event) => updateParam("stock", event.target.checked ? "true" : "")} className="h-4 w-4 accent-orange-500" />
                In stock only
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                Sort by
                <select value={sortBy} onChange={(event) => updateParam("sort", event.target.value, "featured")} disabled={loading} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 disabled:opacity-60">
                  <option value="featured">Featured for you</option>
                  <option value="newest">Newest</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>

          {loadError && <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{loadError}</div>}

          {!loading && (
            <div className="mb-10 flex gap-3 overflow-x-auto pb-2" aria-label="Product categories">
              {["All", ...categories].map((category) => (
                <button key={category} type="button" onClick={() => updateParam("category", category === "All" ? "" : category)} className={`shrink-0 rounded-full px-5 py-2.5 font-semibold transition ${selectedCategory === category ? "bg-orange-500 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600"}`}>
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
              <p className="mt-5 font-semibold text-slate-600">Loading marketplace products…</p>
            </div>
          ) : displayedProducts.length > 0 ? (
            <>
              <ProductGrid products={displayedProducts} />
              {pagination.hasMore && (
                <div className="mt-10 text-center">
                  <button type="button" onClick={() => { setLoadingMore(true); setPage((current) => current + 1); }} disabled={loadingMore} className="rounded-xl bg-slate-950 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60">
                    {loadingMore ? "Loading more…" : "Load more products"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <SearchX className="mx-auto text-orange-400" size={42} />
              <h2 className="mt-5 text-2xl font-black text-slate-950">No matching products yet</h2>
              <p className="mt-3 text-slate-600">Try another search or clear the current filters.</p>
              <button type="button" onClick={clearFilters} className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Shop;
