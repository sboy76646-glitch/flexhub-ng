import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProductGrid from "../components/product/ProductGrid";
import products from "../data/products";
import stores from "../data/stores";

function Storefront() {
  const { storeId } = useParams();
  const store = stores.find((item) => item.id === storeId);

  if (!store) {
    return (
      <Layout>
        <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 text-center">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Store not found</h1>
            <Link to="/stores" className="mt-5 inline-block font-bold text-orange-600">Browse all stores</Link>
          </div>
        </section>
      </Layout>
    );
  }

  const storeProducts = products.filter((product) => product.storeId === store.id);

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-orange-500 text-3xl font-black text-white">
                {store.initials}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black text-slate-950">{store.name}</h1>
                  {store.verified && <BadgeCheck className="text-orange-600" />}
                </div>
                <p className="mt-3 text-lg text-slate-700">{store.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><MapPin size={17} />{store.location}</span>
                  <span className="flex items-center gap-2"><Star size={17} className="fill-yellow-400 text-yellow-400" />{store.rating} from {store.reviewCount} reviews</span>
                </div>
              </div>
            </div>
            <p className="mt-7 max-w-3xl leading-7 text-slate-600">{store.description}</p>
          </div>

          <div className="mb-8 mt-12 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">From this store</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Available products</h2>
            </div>
            <span className="text-sm text-slate-600">{storeProducts.length} product{storeProducts.length === 1 ? "" : "s"}</span>
          </div>
          <ProductGrid products={storeProducts} />
        </div>
      </section>
    </Layout>
  );
}

export default Storefront;
