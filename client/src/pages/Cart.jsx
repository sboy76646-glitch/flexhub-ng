import {
  ArrowLeft,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { usePersonalization } from "../context/PersonalizationContext";

function formatPrice(value) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function Cart() {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();
  const { favoriteCategories } = usePersonalization();

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <Layout>
        <main className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10 sm:px-6 sm:py-16">
          <div className="mx-auto flex min-h-[620px] max-w-5xl items-center justify-center">
            <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-14">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
                <ShoppingBag size={38} strokeWidth={1.8} />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-orange-500">Your FlexHub cart</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Your cart is waiting.</h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">
                Discover phones, fashion, gaming, audio and more from FlexHub sellers and add something you love.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
              >
                Start shopping
                <ChevronRight size={18} />
              </Link>

              {favoriteCategories.length > 0 && (
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-900">
                    <Sparkles size={16} className="text-orange-500" />
                    Shop your interests
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {favoriteCategories.map((category) => (
                      <Link
                        key={category}
                        to={`/shop?category=${encodeURIComponent(category)}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/shop"
            className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-500"
          >
            <ArrowLeft size={17} />
            Continue shopping
          </Link>

          <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">FlexHub checkout</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">Shopping cart</h1>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-4">
              <div className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400 sm:grid sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:gap-5">
                <span>Product</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
              </div>

              {cartItems.map((item) => {
                const lineTotal = item.price * item.quantity;
                const stock = Number(item.stock || 0);
                const atStockLimit = stock > 0 && item.quantity >= stock;

                return (
                  <article
                    key={item.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 sm:p-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:items-center sm:gap-5">
                      <div className="flex min-w-0 gap-4">
                        <Link to={`/product/${item.id}`} className="shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-24 w-24 rounded-2xl bg-slate-100 object-cover sm:h-28 sm:w-28"
                          />
                        </Link>

                        <div className="min-w-0 py-1">
                          <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
                            {item.storeName || item.category || "FlexHub seller"}
                          </p>
                          <Link
                            to={`/product/${item.id}`}
                            className="mt-1 block line-clamp-2 text-base font-black leading-6 text-slate-950 hover:text-orange-500 sm:text-lg"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-2 text-lg font-black text-slate-950">{formatPrice(item.price)}</p>
                          {stock > 0 && (
                            <p className={`mt-1 text-xs font-bold ${atStockLimit ? "text-orange-600" : "text-emerald-600"}`}>
                              {atStockLimit ? "Maximum available quantity" : `${stock} available`}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-slate-400 transition hover:text-red-500"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:block">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-400 sm:hidden">Quantity</span>
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-orange-500"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="min-w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            disabled={atStockLimit}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-400 sm:hidden">Item total</span>
                        <p className="text-lg font-black text-slate-950">{formatPrice(lineTotal)}</p>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <ShieldCheck className="mt-0.5 shrink-0 text-emerald-500" size={20} />
                <div>
                  <p className="font-black text-slate-900">You're in control</p>
                  <p className="mt-1 leading-6">Review your items and quantities before continuing to checkout.</p>
                </div>
              </div>
            </section>

            <aside className="lg:sticky lg:top-28">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                <h2 className="text-xl font-black text-slate-950">Order summary</h2>

                <div className="mt-7 space-y-4 text-sm">
                  <div className="flex justify-between gap-4 text-slate-500">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-bold text-slate-900">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-500">
                    <span>Delivery</span>
                    <span className="font-bold text-slate-700">Calculated at checkout</span>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-slate-200" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Total</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">{formatPrice(cartTotal)}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-400">Before delivery</p>
                </div>

                <Link
                  to="/checkout"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-base font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                >
                  Proceed to checkout
                  <ChevronRight size={19} />
                </Link>

                <Link
                  to="/shop"
                  className="mt-4 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-black text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
                >
                  Continue shopping
                </Link>

                <div className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Truck size={17} className="text-orange-500" />
                    Delivery details shown at checkout
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <ShieldCheck size={17} className="text-emerald-500" />
                    Secure FlexHub checkout
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Cart;
