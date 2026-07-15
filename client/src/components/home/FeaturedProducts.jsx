import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import products from "../../data/products";
import ProductGrid from "../product/ProductGrid";

function FeaturedProducts({ search = "" }) {
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.08),transparent_30rem)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-600">
              <Sparkles size={20} />

              <p className="text-sm font-bold uppercase tracking-[0.25em]">
                Handpicked for you
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
              Featured{" "}
              <span className="brand-gradient-text">
                Products
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Explore some of our most popular gadgets, fashion items,
              electronics, and lifestyle products.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-bold text-orange-600 hover:text-orange-700"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-slate-950">
              No products found
            </h3>

            <p className="mt-3 text-slate-600">
              Try searching with a different product name.
            </p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </section>
  );
}

export default FeaturedProducts;
