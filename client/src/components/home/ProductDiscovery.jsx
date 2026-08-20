import { useEffect, useState } from "react";

import ProductCard from "../product/ProductCard";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

const sectionTitles = {
  recommended: "Recommended for you",
  trending: "Trending on FlexHub",
  recentlyViewed: "Recently viewed",
  popularNearYou: "Popular near you",
  newest: "New on FlexHub",
  becauseYouViewed: "Because you viewed...",
  alsoLike: "You may also like",
};

const guestSections = new Set(["trending", "popularNearYou", "newest", "alsoLike"]);

function DiscoverySection({ title, subtitle, products }) {
  if (!products?.length) return null;

  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
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

function ProductDiscovery() {
  const { isAuthenticated, token } = useAuth();
  const [sections, setSections] = useState({});
  const [location, setLocation] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (isAuthenticated && token) {
      apiRequest("/api/recommendations", { token, timeout: 15000 })
        .then((data) => {
          if (!cancelled) {
            setSections(data.sections || {});
            setLocation(data.location || "");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSections({});
            setLocation("");
          }
        });
    } else {
      // Guests still get useful marketplace discovery from the public product feed.
      apiRequest("/api/products?limit=40", { timeout: 15000 })
        .then((data) => {
          if (!cancelled) {
            const products = data.products || [];
            setSections({
              trending: products,
              popularNearYou: products,
              newest: [...products].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
              ),
              alsoLike: products,
            });
          }
        })
        .catch(() => {
          if (!cancelled) setSections({});
        });
    }

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  const subtitles = {
    recommended: "Personalized from your FlexHub browsing activity.",
    trending: isAuthenticated
      ? "Products getting the most attention across FlexHub."
      : "Popular products shoppers are discovering on FlexHub.",
    recentlyViewed: "Pick up where you left off.",
    popularNearYou: location
      ? `Popular with shoppers around ${location}.`
      : "Popular products from FlexHub sellers.",
    newest: "Fresh listings from marketplace sellers.",
    becauseYouViewed: "More products related to what you've been browsing.",
    alsoLike: "More products you might want to explore.",
  };

  return (
    <div className="bg-white">
      {Object.entries(sectionTitles).map(([key, title]) => {
        const shouldShow = isAuthenticated || guestSections.has(key);
        if (!shouldShow) return null;

        return (
          <DiscoverySection
            key={key}
            title={title}
            subtitle={subtitles[key]}
            products={sections[key] || []}
          />
        );
      })}
    </div>
  );
}

export default ProductDiscovery;
