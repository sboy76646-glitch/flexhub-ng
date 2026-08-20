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
    <section className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-6 lg:px-8 lg:py-4">
        <div className="flex items-stretch gap-4 lg:gap-4">
          <aside className="hidden w-[250px] shrink-0 lg:block xl:w-[270px]">
            <div className="h-[530px] rounded-lg border border-black bg-white px-5 py-8 text-slate-900 shadow-sm">
              <nav aria-label="Marketplace navigation">
                <p className="px-3 pb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Explore FlexHub
                </p>
                <div className="space-y-1.5">
                  {heroNavItems.map(({ label, path, icon: Icon }) => (
                    <NavLink
                      key={`${label}-${path}`}
                      to={path}
                      className={({ isActive }) =>
                        `group flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition ${
                          isActive
                            ? "bg-orange-500 text-white shadow-sm"
                            : "text-slate-900 hover:bg-slate-100 hover:text-slate-950"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={20}
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-600 group-hover:text-orange-500"
                            }
                          />
                          <span>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          <div className="relative h-[530px] min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-950">
            <Hero />

            <div className="relative z-10 flex h-full items-center px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
              <div className="max-w-xl lg:max-w-[550px]">
                <h1 className="text-[42px] font-black leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-[58px]">
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
