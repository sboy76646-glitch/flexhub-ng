import { BadgeCheck, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";

const points = [
  {
    icon: Store,
    title: "Independent mini-stores",
    body: "Discover products from different Nigerian sellers without jumping between scattered pages.",
  },
  {
    icon: BadgeCheck,
    title: "Clear seller identity",
    body: "Every product shows who sells it, where the store is based and whether the seller is verified.",
  },
  {
    icon: Users,
    title: "Built for buyers and sellers",
    body: "Shop across the marketplace or apply to open a store and reach more customers.",
  },
];

function MarketplaceIntro() {
  return (
    <section className="border-y border-slate-200 bg-white py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">
              One marketplace, many businesses
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black text-slate-950 sm:text-4xl">
              Find trusted products. Discover the people selling them.
            </h2>
          </div>
          <Link
            to="/sell"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-orange-500 px-5 py-3 font-bold text-orange-600 transition hover:bg-orange-500 hover:text-white"
          >
            Open your mini-store
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {points.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Icon className="text-orange-600" size={25} />
              <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MarketplaceIntro;
