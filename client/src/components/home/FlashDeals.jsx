import { ArrowRight, Clock3, Flame } from "lucide-react";
import { Link } from "react-router-dom";

import { useCart } from "../../context/CartContext";

function FlashDeals({ products = [] }) {
  const { addToCart } = useCart();

  const deals = products.slice(0, 3).map((product) => {
    const discount =
      product.oldPrice && product.oldPrice > product.price
        ? Math.round(
            ((product.oldPrice - product.price) /
              product.oldPrice) *
              100
          )
        : 0;

    return {
      ...product,
      discount,
    };
  });

  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-slate-900 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_28rem)]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={22} />

              <span className="text-sm font-bold uppercase tracking-[0.22em]">
                Limited-time offers
              </span>
            </div>

            <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">
              Flash Deals
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Grab selected products at discounted prices before the
              offers expire.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-bold text-orange-400 hover:text-orange-300"
          >
            View All Deals
            <ArrowRight size={18} />
          </Link>
        </div>

        {deals.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-950 px-6 py-12 text-center text-slate-400">
            Fresh seller offers will appear here after approval.
          </div>
        ) : <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl transition hover:-translate-y-2 hover:border-orange-500/40 hover:shadow-orange-500/10"
            >
              <div className="relative overflow-hidden">
                <Link to={`/product/${deal.id}`}>
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>

                {deal.discount > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-black text-white shadow-lg">
                    -{deal.discount}%
                  </span>
                )}

                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Clock3 size={15} className="text-orange-400" />
                  Limited stock
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm font-semibold text-orange-400">
                  {deal.category}
                </p>

                <Link to={`/product/${deal.id}`}>
                  <h3 className="mt-2 text-2xl font-black text-white transition hover:text-orange-400">
                    {deal.name}
                  </h3>
                </Link>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-black text-orange-400">
                    ₦{deal.price.toLocaleString()}
                  </span>

                  {deal.oldPrice && (
                    <span className="text-slate-500 line-through">
                      ₦{deal.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(deal)}
                  className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>}

      </div>
    </section>
  );
}

export default FlashDeals;
