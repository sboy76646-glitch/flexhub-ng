import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import categories from "../../data/categories";

function Categories() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08),transparent_30rem)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-orange-400">
            Shop your way
          </p>

          <h2 className="mt-4 text-4xl font-black text-white sm:text-5xl">
            Explore Our{" "}
            <span className="brand-gradient-text">
              Categories
            </span>
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-400">
            Discover premium gadgets, fashion, accessories and lifestyle
            essentials carefully selected for you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <div className="category-icon">
                  <Icon size={32} />
                </div>

                <h3 className="mt-5 font-bold text-white">
                  {category.name}
                </h3>

                <div className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-orange-400">
                  Shop now

                  <ArrowUpRight
                    size={15}
                    className="category-arrow"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categories; 