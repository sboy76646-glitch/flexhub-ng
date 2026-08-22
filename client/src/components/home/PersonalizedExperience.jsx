import { Clock3, Search, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ProductGrid from "../product/ProductGrid";
import { useAuth } from "../../context/AuthContext";
import { usePersonalization } from "../../context/PersonalizationContext";

function PersonalizedExperience({ products = [] }) {
  const { user } = useAuth();
  const {
    viewedProducts,
    recentSearches,
    favoriteCategories,
  } = usePersonalization();

  const displayName = user?.firstName || user?.name?.split(" ")[0] || "there";

  const recommendedProducts = favoriteCategories.length
    ? products.filter((product) => favoriteCategories.includes(product.category)).slice(0, 8)
    : products.slice(0, 8);

  if (!viewedProducts.length && !recentSearches.length && !favoriteCategories.length) {
    return null;
  }

  return (
    <section className="bg-white py-16 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-600">
                <Sparkles size={19} />
                <p className="text-sm font-black uppercase tracking-[0.22em]">Your FlexHub</p>
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Welcome back, {displayName}.
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                FlexHub is starting to learn what you like so your shopping experience can become more relevant over time.
              </p>
            </div>
          </div>

          {favoriteCategories.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              {favoriteCategories.map((category) => (
                <Link
                  key={category}
                  to={`/shop?category=${encodeURIComponent(category)}`}
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50"
                >
                  {category}
                </Link>
              ))}
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Search size={17} className="text-orange-500" />
                Recent searches
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.slice(0, 6).map((query) => (
                  <Link
                    key={query}
                    to={`/shop?q=${encodeURIComponent(query)}`}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600"
                  >
                    {query}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {viewedProducts.length > 0 && (
            <div className="mt-10">
              <div className="mb-5 flex items-center gap-2">
                <Clock3 size={19} className="text-orange-500" />
                <h3 className="text-xl font-black text-slate-950">Recently viewed</h3>
              </div>
              <ProductGrid products={viewedProducts.slice(0, 4)} />
            </div>
          )}

          {recommendedProducts.length > 0 && (
            <div className="mt-12 border-t border-slate-200 pt-10">
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Based on your activity</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">Picked for you</h3>
              </div>
              <ProductGrid products={recommendedProducts} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PersonalizedExperience;
