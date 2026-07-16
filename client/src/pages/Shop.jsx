import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductGrid from "../components/product/ProductGrid";
import { apiRequest } from "../lib/api";

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [marketplaceProducts, setMarketplaceProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("category") || "All";
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        marketplaceProducts
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ],
    [marketplaceProducts]
  );

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    apiRequest("/api/products")
      .then((data) => {
        if (cancelled) return;

        setMarketplaceProducts(
          Array.isArray(data.products) ? data.products : []
        );
      })
      .catch((error) => {
        if (cancelled) return;

        setMarketplaceProducts([]);
        setLoadError(
          error.message || "Unable to load marketplace products."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = marketplaceProducts.filter((product) => {
      const categoryMatches =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const queryMatches =
        !query ||
        [
          product.name,
          product.category,
          product.storeName,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

      return categoryMatches && queryMatches;
    });

    result = [...result];

    if (sortBy === "low") {
      result.sort(
        (first, second) =>
          Number(first.price || 0) -
          Number(second.price || 0)
      );
    }

    if (sortBy === "high") {
      result.sort(
        (first, second) =>
          Number(second.price || 0) -
          Number(first.price || 0)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (first, second) =>
          Number(second.rating || 0) -
          Number(first.rating || 0)
      );
    }

    return result;
  }, [
    marketplaceProducts,
    query,
    selectedCategory,
    sortBy,
  ]);

  function selectCategory(category) {
    const next = new URLSearchParams(searchParams);

    if (category === "All") {
      next.delete("category");
    } else {
      next.set("category", category);
    }

    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
    setSortBy("featured");
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">
                Marketplace
              </p>

              <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">
                Shop products from independent stores
              </h1>

              <p className="mt-3 text-slate-600">
                {loading
                  ? "Loading products…"
                  : `${filteredProducts.length} result${
                      filteredProducts.length === 1 ? "" : "s"
                    }${
                      query
                        ? ` for “${searchParams.get("q")}”`
                        : ""
                    }`}
              </p>
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              Sort by

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                disabled={loading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </label>
          </div>

          {loadError && !loading && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
              {loadError}
            </div>
          )}

          {!loading && (
            <div
              className="mb-10 flex gap-3 overflow-x-auto pb-2"
              aria-label="Product categories"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`shrink-0 rounded-full px-5 py-2.5 font-semibold transition ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
              <p className="mt-5 font-semibold text-slate-600">
                Loading marketplace products…
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <SearchX
                className="mx-auto text-orange-400"
                size={42}
              />

              <h2 className="mt-5 text-2xl font-black text-slate-950">
                No matching products yet
              </h2>

              <p className="mt-3 text-slate-600">
                {loadError
                  ? "The marketplace could not be loaded. Check that your backend server is running."
                  : "Try another search or clear the current filters."}
              </p>

              {!loadError && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Shop; 