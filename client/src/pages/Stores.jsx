import { BadgeCheck, MapPin, Star, Store } from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import stores from "../data/stores";

function Stores() {
  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-600">
              Marketplace directory
            </p>
            <h1 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
              Meet the stores behind the products
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Browse seller pages, check their location and ratings, then shop their products directly.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <article key={store.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white">
                    {store.initials}
                  </div>
                  {store.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-700">
                      <BadgeCheck size={16} /> Verified
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-black text-slate-950">{store.name}</h2>
                <p className="mt-2 font-semibold text-orange-600">{store.tagline}</p>
                <p className="mt-4 flex-1 leading-7 text-slate-600">{store.description}</p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-700">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-orange-600" />{store.location}</span>
                  <span className="flex items-center gap-1.5"><Star size={16} className="fill-yellow-400 text-yellow-400" />{store.rating} ({store.reviewCount})</span>
                </div>
                <Link to={`/stores/${store.id}`} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-orange-500">
                  <Store size={18} /> Visit store
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Stores;
