import { ArrowRight, Clock3, Flame, Heart, ShoppingCart, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import ProductCard from "../product/ProductCard";

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function DealCard({ product }) {
  const [liked, setLiked] = useState(false);
  const image = product.image || product.images?.[0] || product.imageUrl || "/placeholder-product.jpg";
  const oldPrice = Number(product.oldPrice || 0);
  const price = Number(product.price || 0);
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product.name || "Flash deal product"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-lg">
          {discount ? `-${discount}%` : "DEAL"}
        </div>
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setLiked((value) => !value)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-700 shadow-md backdrop-blur transition hover:scale-105"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current text-orange-500" : ""}`} />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id || product.id}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold text-slate-900 transition group-hover:text-orange-600">
            {product.name || "Untitled product"}
          </h3>
        </Link>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950">{formatPrice(price)}</p>
            {oldPrice > price && <p className="text-xs font-medium text-slate-400 line-through">{formatPrice(oldPrice)}</p>}
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("flexhub:add-to-cart", { detail: product }))}
            aria-label={`Add ${product.name || "product"} to cart`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white transition hover:bg-orange-500"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-slate-500">Selling fast</p>
      </div>
    </article>
  );
}

function FlashDeals({ products = [] }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(2 * 60 * 60 + 14 * 60 + 37);
  const deals = products
    .filter((product) => product.oldPrice && product.oldPrice > product.price)
    .slice(0, 10);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.unobserve(entry.target);
    }, { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 0 ? 2 * 60 * 60 + 14 * 60 + 37 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const values = [Math.floor(secondsLeft / 3600), Math.floor((secondsLeft % 3600) / 60), secondsLeft % 60];
    return values.map((value) => String(value).padStart(2, "0"));
  }, [secondsLeft]);

  if (deals.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-y border-slate-800 bg-slate-950 py-10 sm:py-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className={`mb-7 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-[opacity,transform] duration-700 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Zap className="h-7 w-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-orange-400">
                <Flame className="h-4 w-4 fill-current" /> Flash sale
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Deals that won't wait.</h2>
              <p className="mt-1 text-sm text-slate-400">Limited-time prices on products shoppers are grabbing fast.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ends in</span>
            </div>
            <div className="flex items-center gap-1.5">
              {countdown.map((unit, index) => (
                <div key={`${unit}-${index}`} className="min-w-[42px] rounded-xl bg-white px-2 py-2 text-center shadow-lg sm:min-w-[48px]">
                  <span className="text-lg font-black tabular-nums text-slate-950">{unit}</span>
                  <span className="block text-[9px] font-bold uppercase text-slate-400">{["hrs", "min", "sec"][index]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">Today's hottest deals</p>
            <p className="text-xs text-slate-500">Save more before the timer runs out.</p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-400 transition hover:text-orange-300">
            See all deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden">
          {deals.map((deal, index) => (
            <div
              key={deal._id || deal.id}
              className={`w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${isVisible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"}`}
              style={{ transitionDelay: isVisible ? `${150 + index * 70}ms` : "0ms" }}
            >
              <DealCard product={deal} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashDeals;
