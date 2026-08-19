import { ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

import Hero from "./Hero";

function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <Hero />

      <div className="relative z-10 mx-auto flex min-h-[500px] max-w-7xl items-center px-5 py-12 sm:min-h-[510px] sm:px-8 sm:py-14 lg:min-h-[530px] lg:px-10 lg:py-16">
        <div className="max-w-xl lg:max-w-[550px]">
          <h1 className="text-[42px] font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-[58px]">
            Everything you want.
            <br />
            <span className="text-orange-500">
              One place to shop.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-200 sm:text-base sm:leading-7 lg:text-[17px]">
            Shop phones, laptops, fashion, audio gear, gaming products and
            more from independent sellers across Nigeria.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-orange-600 sm:h-12 sm:px-6"
            >
              Shop now
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/stores"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:text-orange-400 sm:h-12 sm:px-6"
            >
              <ShoppingBag size={17} />
              Browse mini-stores
            </Link>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-slate-950/30 to-transparent"
      />
    </section>
  );
}

export default HeroBanner; 