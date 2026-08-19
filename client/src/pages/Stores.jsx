import { MapPin, Search, Star, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import SellerTrustBadge from "../components/trust/SellerTrustBadge";
import { apiRequest } from "../lib/api";

function normalizeStore(store) {
  return {
    ...store,
    id: store.slug,
    tagline: store.category,
    initials: store.name
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase(),
    rating: store.sellerTrust?.averageRating || null,
    reviewCount: store.sellerTrust?.verifiedReviewCount || 0,
  };
}

function Stores() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [marketplaceStores, setMarketplaceStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setMarketplaceStores([]);
      setLoading(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [debouncedQuery]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: "18" });
    if (debouncedQuery) params.set("q", debouncedQuery);

    const statusTimer = window.setTimeout(() => setLoadError(""), 0);

    apiRequest(`/api/stores?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const nextStores = Array.isArray(data.stores) ? data.stores.map(normalizeStore) : [];
        setMarketplaceStores((current) => page === 1 ? nextStores : [...current, ...nextStores]);
        setPagination(data.pagination || { total: nextStores.length, hasMore: false });
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        if (page === 1) setMarketplaceStores([]);
        setLoadError(error.message || "Unable to load approved stores.");
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(statusTimer);
      controller.abort();
    };
  }, [page, debouncedQuery]);

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">Marketplace directory</p>
            <h1 className="mt-4 text-4xl font-black text-slate-950 sm:text-5xl">Meet the stores behind the products</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">Browse approved seller pages, check their location and ratings, then shop their products directly.</p>
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

          {!loading && <p className="mt-4 text-sm text-slate-500">{pagination.total || 0} approved store{pagination.total === 1 ? "" : "s"}</p>}
          {loadError && <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{loadError}</div>}

          {loading ? (
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
              <p className="mt-5 font-semibold text-slate-600">Loading approved mini-stores…</p>
            </div>
          ) : marketplaceStores.length > 0 ? (
            <>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {marketplaceStores.map((store) => (
                  <article key={store.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white">{store.initials}</div>
                      <SellerTrustBadge sellerTrust={store.sellerTrust} />
                    </div>
                    <h2 className="mt-6 text-2xl font-black text-slate-950">{store.name}</h2>
                    <p className="mt-2 font-semibold text-orange-600">{store.tagline}</p>
                    <p className="mt-4 flex-1 leading-7 text-slate-600">{store.description}</p>
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><MapPin size={16} className="text-orange-400" />{store.location}</span>
                      {store.rating && <span className="flex items-center gap-1.5"><Star size={16} className="fill-yellow-400 text-yellow-400" />{store.rating} ({store.reviewCount})</span>}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                      <div><p className="text-slate-500">Trust score</p><p className="mt-1 font-black">{store.sellerTrust?.score || 0}/100</p></div>
                      <div><p className="text-slate-500">Completed orders</p><p className="mt-1 font-black">{store.sellerTrust?.completedOrders || 0}</p></div>
                    </div>
                    <Link to={`/stores/${store.id}`} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-orange-500"><Store size={18} />Visit store</Link>
                  </article>
                ))}
              </div>
              {pagination.hasMore && (
                <div className="mt-10 text-center">
                  <button type="button" onClick={() => { setLoadingMore(true); setPage((current) => current + 1); }} disabled={loadingMore} className="rounded-xl bg-slate-950 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60">
                    {loadingMore ? "Loading more…" : "Load more stores"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-10 text-center">
              <h2 className="text-2xl font-black">{debouncedQuery ? "No stores match that search" : "No approved mini-stores yet"}</h2>
              <p className="mt-2 text-slate-600">{debouncedQuery ? "Try a different business name, category or location." : "Approved seller stores will appear here."}</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Stores;
