import { ArrowRight, Clock3, Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../product/ProductCard";

function FlashDeals({ products = [] }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const deals = products
    .filter((product) => product.oldPrice && product.oldPrice > product.price)
    .slice(0, 5);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (deals.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-y border-slate-800 bg-slate-900 py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_28rem)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`relative mb-7 border-l-4 border-orange-500 pl-4 transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:mb-8 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
          <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-orange-400">
              <Flame size={18} />
              <span>Flash deals</span>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Flash <span className="relative inline-block text-orange-400 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-orange-500/80">Deals</span>
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-300 sm:text-base">
              <Clock3 size={17} className="shrink-0 text-orange-400" />
              Prices reduced for a short time. Grab them before they are gone.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-slate-200 transition hover:text-orange-400"
          >
            See all
            <ArrowRight size={16} />
          </Link>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${isVisible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`}
              style={{ transitionDelay: isVisible ? `${150 + index * 90}ms` : "0ms" }}
            >
              <ProductCard product={deal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashDeals;
