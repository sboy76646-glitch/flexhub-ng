import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ProductGrid from "../product/ProductGrid";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-36 animate-pulse bg-slate-200 sm:h-44" />
      <div className="space-y-3 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-7 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function FeaturedProducts({ products = [], search = "", loading = false, error = "", onRetry }) {
  const filteredProducts = products.filter((product) =>
    String(product.name || "").toLowerCase().includes(search.toLowerCase())
  );
  const visibleProducts = filteredProducts.slice(0, 10);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_30rem)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400">
              <Sparkles size={20} />
              <p className="text-sm font-bold uppercase tracking-[0.25em]">
                Handpicked for you
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
              Featured <span className="brand-gradient-text">Products</span>
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              A changing selection of products from stores across FlexHub NG.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: 10 }, (_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : error && products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-slate-950">Products couldn't load</h3>
            <p className="mt-3 text-slate-600">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Try again
            </button>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-slate-950">
              {search ? "No products found" : "Products are coming soon"}
            </h3>
            <p className="mt-3 text-slate-600">
              {search ? "Try searching with a different product name." : "Check back soon for products from FlexHub stores."}
            </p>
          </div>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
