import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
                <Heart size={15} fill="currentColor" />
                Saved for later
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                My Wishlist
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {wishlistItems.length === 0
                  ? "Keep the products you love close."
                  : `${wishlistItems.length} ${wishlistItems.length === 1 ? "product" : "products"} saved`}
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:self-auto"
              >
                <Trash2 size={16} />
                Clear wishlist
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <section className="flex min-h-[620px] items-center justify-center py-12">
              <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-14">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
                  <Heart size={38} strokeWidth={1.8} />
                </div>
                <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
                  Your saved collection
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Nothing saved yet.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                  Tap the heart on products you love and they’ll stay here until you’re ready to buy.
                </p>
                <Link
                  to="/shop"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  Explore FlexHub
                  <ArrowRight size={18} />
                </Link>
              </div>
            </section>
          ) : (
            <section className="py-8 sm:py-10">
              <div className="mb-6 flex items-center gap-2 text-sm font-black text-slate-900">
                <Sparkles size={17} className="text-orange-500" />
                Your saved picks
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {wishlistItems.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
                  >
                    <div className="relative overflow-hidden bg-slate-100">
                      <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
                        />
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label={`Remove ${product.name} from wishlist`}
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/95 text-orange-500 shadow-md backdrop-blur transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Heart size={18} fill="currentColor" />
                      </button>
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-orange-500">
                        {product.storeName || product.category || "FlexHub seller"}
                      </p>
                      <Link
                        to={`/product/${product.id}`}
                        className="mt-1 block line-clamp-2 min-h-[3rem] text-base font-black leading-6 text-slate-950 transition hover:text-orange-500"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-400">Current price</p>
                          <p className="mt-0.5 text-xl font-black text-slate-950">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-black text-white shadow-md shadow-orange-500/15 transition hover:bg-orange-600"
                      >
                        <ShoppingCart size={17} />
                        Add to cart
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black text-slate-400 transition hover:bg-slate-50 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                        Remove from wishlist
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </Layout>
  );
}

export default Wishlist;
