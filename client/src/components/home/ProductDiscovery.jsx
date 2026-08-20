import { useEffect, useMemo, useState } from "react";

import ProductCard from "../product/ProductCard";

const RECENTLY_VIEWED_KEY = "flexhub_recently_viewed";
const LOCATION_KEY = "flexhub_location";

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function DiscoverySection({ title, subtitle, products }) {
  if (!products.length) return null;

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductDiscovery({ products = [] }) {
  const [recentIds, setRecentIds] = useState([]);
  const [location, setLocation] = useState("");

  useEffect(() => {
    setRecentIds(readJson(RECENTLY_VIEWED_KEY, []));
    setLocation(localStorage.getItem(LOCATION_KEY) || "");
  }, [products]);

  const discovery = useMemo(() => {
    if (!products.length) return {};

    const byId = new Map(products.map((product) => [String(product.id), product]));
    const recentlyViewed = recentIds
      .map((id) => byId.get(String(id)))
      .filter(Boolean);

    const recentCategories = new Set(recentlyViewed.map((product) => product.category).filter(Boolean));
    const categoryMatches = products.filter((product) => recentCategories.has(product.category));

    const score = (product) =>
      Number(product.rating || 0) * 10 +
      Number(product.reviewCount || product.reviews?.length || 0) +
      (Number(product.stock || 0) > 0 ? 2 : 0);

    const trending = [...products].sort((a, b) => score(b) - score(a));
    const newest = [...products].reverse();
    const popularNearYou = location
      ? products.filter((product) =>
          String(product.storeLocation || "").toLowerCase().includes(location.toLowerCase())
        )
      : [];

    const recommended = categoryMatches.length
      ? categoryMatches
      : trending;

    const becauseYouViewed = categoryMatches.filter(
      (product) => !recentIds.includes(product.id) && !recentIds.includes(String(product.id))
    );

    const alsoLike = trending.filter(
      (product) => !recentCategories.has(product.category)
    );

    return {
      recentlyViewed,
      trending,
      newest,
      popularNearYou: popularNearYou.length ? popularNearYou : trending,
      recommended,
      becauseYouViewed,
      alsoLike: alsoLike.length ? alsoLike : trending,
    };
  }, [products, recentIds, location]);

  if (!products.length) return null;

  return (
    <div className="bg-white">
      <DiscoverySection
        title="Recommended for you"
        subtitle="Picks based on the products you browse on FlexHub."
        products={discovery.recommended || []}
      />

      <DiscoverySection
        title="Trending on FlexHub"
        subtitle="Popular products shoppers are checking out right now."
        products={discovery.trending || []}
      />

      <DiscoverySection
        title="Recently viewed"
        subtitle="Pick up where you left off."
        products={discovery.recentlyViewed || []}
      />

      <DiscoverySection
        title="Popular near you"
        subtitle={location ? `Popular with shoppers around ${location}.` : "Popular products from FlexHub sellers."}
        products={discovery.popularNearYou || []}
      />

      <DiscoverySection
        title="New on FlexHub"
        subtitle="Fresh listings from marketplace sellers."
        products={discovery.newest || []}
      />

      <DiscoverySection
        title="Because you viewed..."
        subtitle="More products from categories you've recently explored."
        products={discovery.becauseYouViewed || []}
      />

      <DiscoverySection
        title="You may also like"
        subtitle="More products selected from popular FlexHub listings."
        products={discovery.alsoLike || []}
      />
    </div>
  );
}

export default ProductDiscovery;
