import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import categories from "../../data/categories";

function Categories() {
  return (
    <section className="relative overflow-hidden bg-white py-20 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_30rem)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-400">
            Shop your way
          </p>

          <h2 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
            Explore Our <span className="brand-gradient-text">Categories</span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Browse products by category across independent stores in the marketplace.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-slate-100">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between gap-2 px-3.5 py-3.5">
                <h3 className="truncate text-sm font-bold text-slate-950 sm:text-[15px]">
                  {category.name}
                </h3>

                <ArrowUpRight
                  size={17}
                  className="shrink-0 text-orange-500 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
