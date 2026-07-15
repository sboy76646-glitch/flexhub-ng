import { BadgeCheck, MapPin, Search, Star, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import stores from "../data/stores";
import { apiRequest } from "../lib/api";

function Stores() {
  const [query, setQuery] = useState("");
  const [marketplaceStores, setMarketplaceStores] = useState(stores);

  useEffect(() => {
    apiRequest("/api/stores")
      .then((data) => {
        if (!data.stores?.length) return;
        setMarketplaceStores(
          data.stores.map((store) => ({
            ...store,
            id: store.slug,
            tagline: store.category,
            initials: store.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase(),
            rating: null,
            reviewCount: 0,
          }))
        );
      })
      .catch(() => {});
  }, []);

  const filteredStores = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return marketplaceStores;
    return marketplaceStores.filter((store) =>
      [store.name, store.category, store.location, store.tagline].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [marketplaceStores, query]);

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">
              Marketplace directory
            </p>
            <h1 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">
              Meet the stores behind the products
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Browse seller pages, check their location and ratings, then shop their products directly.
            </p>
          </div>

          <div className="mt-10 flex max-w-xl items-center rounded-2xl border border-slate-300 bg-white px-4 shadow-sm focus-within:border-orange-500">
            <Search size={20} className="text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stores by name, category or city"
              className="min-w-0 flex-1 bg-transparent px-3 py-4 text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <article key={store.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white">
                    {store.initials}
                  </div>
                  {store.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-400">
                      <BadgeCheck size={16} /> Verified
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-black text-slate-950">{store.name}</h2>
                <p className="mt-2 font-semibold text-orange-600">{store.tagline}</p>
                <p className="mt-4 flex-1 leading-7 text-slate-600">{store.description}</p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-orange-400" />{store.location}</span>
                  {store.rating && <span className="flex items-center gap-1.5"><Star size={16} className="fill-yellow-400 text-yellow-400" />{store.rating} ({store.reviewCount})</span>}
                </div>
                <Link to={`/stores/${store.id}`} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-orange-500">
                  <Store size={18} /> Visit store
                </Link>
              </article>
            ))}
          </div>

          {filteredStores.length === 0 && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-black">No stores match that search</h2>
              <p className="mt-2 text-slate-600">Try a different business name, category or location.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Stores;
