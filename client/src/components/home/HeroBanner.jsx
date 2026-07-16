import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import Hero from "./Hero";

function HeroBanner() {
  return (
    <section className="relative isolate min-h-[690px] overflow-hidden bg-slate-950 text-white">
      <Hero />

      <div className="relative z-10 mx-auto flex min-h-[690px] max-w-7xl items-center px-6 py-20 lg:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-slate-950/60 px-4 py-2 text-sm font-bold text-orange-400 shadow-lg backdrop-blur-md">
            <BadgeCheck size={17} />
            Verified Nigerian marketplace
          </span>

          <h1 className="mt-7 text-5xl font-black leading-[1.04] sm:text-6xl lg:text-7xl">
            Shop trusted products from{" "}
            <span className="text-orange-500">
              independent sellers.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Discover admin-approved products, secure payments, verified
            mini-stores and reliable delivery across Nigeria.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600"
            >
              Shop now
              <ArrowRight size={19} />
            </Link>

            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-4 font-bold text-white backdrop-blur-md transition hover:-translate-y-1 hover:border-orange-400 hover:text-orange-400"
            >
              <ShoppingBag size={19} />
              Browse mini-stores
            </Link>
          </div>

          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
              <ShieldCheck className="shrink-0 text-orange-400" size={22} />
              <span className="text-sm font-semibold text-slate-200">
                Admin-approved sellers
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
              <BadgeCheck className="shrink-0 text-orange-400" size={22} />
              <span className="text-sm font-semibold text-slate-200">
                Verified products
              </span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 backdrop-blur-md">
              <Truck className="shrink-0 text-orange-400" size={22} />
              <span className="text-sm font-semibold text-slate-200">
                Delivery tracking
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-slate-950/90 to-transparent"
      />
    </section>
  );
}

export default HeroBanner; 