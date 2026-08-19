import { MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductGrid from "../components/product/ProductGrid";
import SellerTrustBadge from "../components/trust/SellerTrustBadge";
import { apiRequest } from "../lib/api";

function Storefront() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const storeRequest = page === 1
      ? apiRequest(`/api/stores/${storeId}`, { signal: controller.signal })
      : Promise.resolve(null);

    Promise.all([
      storeRequest,
      apiRequest(
        `/api/products?store=${encodeURIComponent(storeId)}&page=${page}&limit=24`,
        { signal: controller.signal }
      ),
    ])
      .then(([storeData, productData]) => {
        if (cancelled) return;

        if (storeData?.store) {
          const item = storeData.store;
          setStore({
            ...item,
            id: item.slug,
            tagline: item.category,
            initials: item.name
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase(),
            rating: item.sellerTrust?.averageRating || null,
            reviewCount: item.sellerTrust?.verifiedReviewCount || 0,
          });
        }

        const nextProducts = Array.isArray(productData.products) ? productData.products : [];
        setStoreProducts((current) => page === 1 ? nextProducts : [...current, ...nextProducts]);
        setPagination(productData.pagination || { total: nextProducts.length, hasMore: false });
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        if (page === 1) {
          setStore(null);
          setStoreProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [storeId, page]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[65vh] flex-col items-center justify-center bg-slate-50 text-slate-500">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="mt-5 font-semibold">Loading store…</p>
        </div>
      </Layout>
    );
  }

  if (!store) {
    return (
      <Layout>
        <section className="flex min-h-[65vh] items-center justify-center bg-slate-950 px-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-white">
              Store not found
            </h1>

            <p className="mt-3 text-slate-400">
              This store may not be approved, or it may have been suspended
              or removed.
            </p>

            <Link
              to="/stores"
              className="mt-5 inline-block font-bold text-orange-400"
            >
              Browse approved stores
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-orange-500 text-3xl font-black text-white">
                {store.initials}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-950">
                    {store.name}
                  </h1>

                  <SellerTrustBadge sellerTrust={store.sellerTrust} />
                </div>

                <p className="mt-3 text-lg text-slate-700">
                  {store.tagline}
                </p>

                <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <MapPin size={17} />
                    {store.location}
                  </span>

                  {store.rating && (
                    <span className="flex items-center gap-2">
                      <Star
                        size={17}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      {store.rating} from {store.reviewCount} reviews
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-7 max-w-3xl leading-7 text-slate-600">
              {store.description}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Trust score</p><p className="mt-1 text-2xl font-black">{store.sellerTrust?.score || 0}/100</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Completed orders</p><p className="mt-1 text-2xl font-black">{store.sellerTrust?.completedOrders || 0}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">On-time delivery</p><p className="mt-1 text-2xl font-black">{store.sellerTrust?.onTimeDeliveryRate || 0}%</p></div></div>
          </div>

          <div className="mb-8 mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                From this store
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Available products
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              {pagination.total || storeProducts.length} product
              {(pagination.total || storeProducts.length) === 1 ? "" : "s"}
            </span>
          </div>

          {storeProducts.length > 0 ? (
            <>
              <ProductGrid products={storeProducts} />
              {pagination.hasMore && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoadingMore(true);
                      setPage((current) => current + 1);
                    }}
                    disabled={loadingMore}
                    className="rounded-xl bg-slate-950 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                  >
                    {loadingMore ? "Loading more…" : "Load more from this store"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              This store has no approved products yet.
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

export default Storefront;
