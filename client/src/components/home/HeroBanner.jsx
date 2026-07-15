import { ArrowRight, BadgeCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import products from "../../data/products";

function HeroBanner() {
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_32rem)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* Left side */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
              <BadgeCheck size={17} />
              Nigeria&apos;s marketplace for independent stores
            </span>

            <h1 className="mt-8 text-5xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Shop beyond
              <br />
              one store.
              <br />

              <span className="brand-gradient-text">
                Find your next favourite.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-400">
              Browse products from growing Nigerian businesses, compare
              trusted sellers and buy from one simple marketplace.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 font-bold text-white shadow-xl shadow-orange-500/20 hover:-translate-y-1 hover:bg-orange-600"
              >
                Shop Now
                <ArrowRight size={19} />
              </Link>

              <Link
                to="/stores"
                className="inline-flex items-center rounded-2xl border border-slate-700 px-7 py-4 font-bold text-white hover:-translate-y-1 hover:border-orange-500 hover:text-orange-400"
              >
                Browse Mini-stores
              </Link>
            </div>

            <div className="mt-14 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-2xl font-black text-orange-400">
                  Multiple stores
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  More choice in one place
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-2xl font-black text-orange-400">
                  Seller profiles
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Know who you are buying from
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center gap-2 text-orange-400">
                  <Truck size={21} />

                  <h2 className="text-lg font-black">
                    Nationwide
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Delivery across Nigeria
                </p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="relative min-h-[500px]">
            <div className="absolute inset-10 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative h-full min-h-[500px]">

              {featuredProducts[0] && (
                <div className="absolute left-0 top-12 w-[68%] overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-orange-500/10">
                  <img
                    src={featuredProducts[0].image}
                    alt={featuredProducts[0].name}
                    fetchPriority="high"
                    decoding="async"
                    className="h-72 w-full rounded-[1.5rem] object-cover"
                  />

                  <div className="p-4">
                    <p className="text-sm text-orange-400">
                      {featuredProducts[0].category}
                    </p>

                    <h3 className="mt-1 text-xl font-bold">
                      {featuredProducts[0].name}
                    </h3>
                  </div>
                </div>
              )}

              {featuredProducts[1] && (
                <div className="absolute right-0 top-0 w-[43%] rotate-3 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
                  <img
                    src={featuredProducts[1].image}
                    alt={featuredProducts[1].name}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full rounded-2xl object-cover"
                  />

                  <p className="px-2 pb-2 pt-3 font-bold">
                    {featuredProducts[1].name}
                  </p>
                </div>
              )}

              {featuredProducts[2] && (
                <div className="absolute bottom-0 right-4 w-[47%] -rotate-2 overflow-hidden rounded-3xl border border-orange-500/30 bg-slate-900 p-3 shadow-2xl shadow-orange-500/10">
                  <img
                    src={featuredProducts[2].image}
                    alt={featuredProducts[2].name}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full rounded-2xl object-cover"
                  />

                  <p className="px-2 pb-2 pt-3 font-bold">
                    {featuredProducts[2].name}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
