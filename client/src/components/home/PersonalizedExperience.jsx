import { Clock3, Search, Sparkles, Tag } from "lucide-react";
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
    favoriteBrands,
    averagePrice,
    rankProducts,
  } = usePersonalization();

  const displayName = user?.firstName || user?.name?.split(" ")[0] || "there";
  const recommendedProducts = rankProducts(products).filter(
    (product) => !viewedProducts.some((item) => String(item.id) === String(product.id))
  ).slice(0, 8);

  if (!viewedProducts.length && !recentSearches.length && !favoriteCategories.length) return null;

  return (
    <section className="bg-white py-16 text-slate-900 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-600">
                <Sparkles size={19} />
                <p className="text-sm font-black uppercase tracking-[0.22em]">Your FlexHub</p>
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Welcome back, {displayName}.
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Your recommendations now adapt to the categories, brands and price points you interact with most.
              </p>
            </div>

            {averagePrice > 0 && (
              <div className="rounded-2xl border border-orange-200 bg-white px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Typical browsing price</p>
                <p className="mt-1 text-lg font-black text-orange-600">₦{Math.round(averagePrice).toLocaleString()}</p>
              </div>
            )}
          </div>

          {favoriteCategories.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              {favoriteCategories.map((category) => (
                <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`} className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-700 transition hover:border-orange-400 hover:bg-orange-50">
                  {category}
                </Link>
              ))}
            </div>
          )}

          {favoriteBrands.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Tag size={17} className="text-orange-500" /> Favorite brands
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {favoriteBrands.map((brand) => (
                  <span key={brand} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700">{brand}</span>
                ))}
              </div>
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Search size={17} className="text-orange-500" /> Recent searches
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.slice(0, 6).map((query) => (
                  <Link key={query} to={`/shop?q=${encodeURIComponent(query)}`} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-orange-300 hover:text-orange-600">
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
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Intelligent match</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">Picked for you</h3>
                <p className="mt-1 text-sm text-slate-500">Ranked from your activity — not a one-size-fits-all product list.</p>
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
