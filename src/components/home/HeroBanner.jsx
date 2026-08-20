import { ArrowRight, Flame, Grid2X2, Home as HomeIcon, ShoppingBag, Store } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import Hero from "./Hero";

const heroNavItems = [
  { label: "Home", path: "/", icon: HomeIcon },
  { label: "Shop", path: "/shop", icon: ShoppingBag },
  { label: "Categories", path: "/shop", icon: Grid2X2 },
  { label: "Flash Deals", path: "/shop?deal=flash", icon: Flame },
  { label: "Mini Stores", path: "/stores", icon: Store },
];

function HeroBanner() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-6 lg:px-8">
        <div className="flex gap-4 lg:gap-5">
          <aside className="hidden w-[190px] shrink-0 lg:block">
            <div className="h-full min-h-[530px] border border-slate-800 bg-slate-950 px-3 py-7">
              <nav aria-label="Marketplace navigation">
                <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Explore FlexHub
                </p>
                <div className="space-y-1">
                  {heroNavItems.map(({ label, path, icon: Icon }) => (
                    <NavLink
                      key={`${label}-${path}`}
                      to={path}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-500 group-hover:text-orange-400"
                            }
                          />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>

                <div className="mx-3 my-6 border-t border-slate-800" />

                <Link
                  to="/sell"
                  className="mx-1 flex items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-3 text-center text-xs font-bold text-orange-400 transition hover:bg-orange-500 hover:text-white"
                >
                  Sell on FlexHub
                </Link>
              </nav>
            </div>
          </aside>

          <div className="relative min-w-0 flex-1 overflow-hidden bg-slate-950">
            <Hero />

            <div className="relative z-10 flex min-h-[530px] items-center px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
              <div className="max-w-xl lg:max-w-[550px]">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-100 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Your marketplace, your way
                </p>

                <h1 className="text-[42px] font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-[58px]">
                  Everything you want.
                  <br />
                  <span className="text-orange-500">One place to shop.</span>
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
