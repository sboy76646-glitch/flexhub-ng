import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductGrid from "../components/product/ProductGrid";
import products from "../data/products";
import { apiRequest } from "../lib/api";

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [marketplaceProducts, setMarketplaceProducts] = useState(products);
  const [usingSamples, setUsingSamples] = useState(true);
  const selectedCategory = searchParams.get("category") || "All";
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const categories = useMemo(
    () => ["All", ...new Set(marketplaceProducts.map((product) => product.category))],
    [marketplaceProducts]
  );

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/products")
      .then((data) => {
        if (cancelled) return;
        setMarketplaceProducts(data.products);
        setUsingSamples(false);
      })
      .catch(() => {
        if (!cancelled) setUsingSamples(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = marketplaceProducts.filter((product) => {
      const categoryMatches = selectedCategory === "All" || product.category === selectedCategory;
      const queryMatches = !query || [product.name, product.category, product.storeName].some((value) => String(value || "").toLowerCase().includes(query));
      return categoryMatches && queryMatches;
    });

    result = [...result];
    if (sortBy === "low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [marketplaceProducts, query, selectedCategory, sortBy]);

  function selectCategory(category) {
    const next = new URLSearchParams(searchParams);
    if (category === "All") next.delete("category");
    else next.set("category", category);
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
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">Marketplace</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Shop products from independent stores</h1>
              <p className="mt-3 text-slate-600">{filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}{query ? ` for “${searchParams.get("q")}”` : ""}</p>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              Sort by
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500">
                <option value="featured">Featured</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </label>
          </div>

          {usingSamples && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
              Showing the original catalogue samples while the marketplace API is unavailable. Approved seller products replace these automatically.
            </div>
          )}

          <div className="mb-10 flex gap-3 overflow-x-auto pb-2" aria-label="Product categories">
            {categories.map((category) => (
              <button key={category} onClick={() => selectCategory(category)} className={`shrink-0 rounded-full px-5 py-2.5 font-semibold transition ${selectedCategory === category ? "bg-orange-500 text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-600"}`}>
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
              <SearchX className="mx-auto text-orange-400" size={42} />
              <h2 className="mt-5 text-2xl font-black text-slate-950">No matching products yet</h2>
              <p className="mt-3 text-slate-600">Try another search or clear the current filters.</p>
              <button onClick={clearFilters} className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Shop;
