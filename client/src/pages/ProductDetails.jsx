import { useEffect, useState } from "react";
import { BadgeCheck, MapPin, Store } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../lib/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setProduct(null);
    setQuantity(1);

    apiRequest(`/api/products/${id}`)
      .then((data) => {
        if (!cancelled) {
          setProduct(data.product || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 text-slate-500">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
          <p className="mt-5 font-semibold">
            Loading product…
          </p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-6 text-center">
          <h1 className="text-3xl font-black text-slate-950">
            Product not found
          </h1>

          <p className="mt-3 text-slate-600">
            This product may not be approved, or it may have been removed.
          </p>

          <Link
            to="/shop"
            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
          >
            Return to shop
          </Link>
        </div>
      </Layout>
    );
  }

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);

  function addItemToCart() {
    addToCart(product, quantity);
  }

  function buyNow() {
    addToCart(product, quantity);
    navigate("/checkout");
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-16 text-slate-900">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                decoding="async"
                className="w-full rounded-2xl object-cover"
              />
            </div>
          </div>

          <div>
            <span className="rounded-full bg-orange-500 px-4 py-2 text-white">
              {product.category}
            </span>

            <h1 className="mt-6 text-5xl font-bold text-slate-950">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-xl text-yellow-500">
                {product.rating
                  ? `⭐ ${product.rating}`
                  : "New listing"}
              </span>

              <span
                className={
                  stock > 0
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                {stock > 0
                  ? `${stock} in stock`
                  : "Sold out"}
              </span>
            </div>

            <div className="mt-8 flex items-center gap-5">
              <h2 className="text-5xl font-bold text-orange-600">
                ₦{price.toLocaleString()}
              </h2>

              {oldPrice > 0 && (
                <h3 className="text-2xl text-gray-500 line-through">
                  ₦{oldPrice.toLocaleString()}
                </h3>
              )}
            </div>

            <p className="mt-8 leading-8 text-slate-600">
              {product.description}
            </p>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Sold by
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <Link
                  to={`/stores/${product.storeId}`}
                  className="flex items-center gap-2 font-bold text-slate-950 hover:text-orange-600"
                >
                  <Store
                    size={19}
                    className="text-orange-400"
                  />

                  {product.storeName}

                  {product.sellerVerified && (
                    <BadgeCheck
                      size={18}
                      className="text-orange-400"
                    />
                  )}
                </Link>

                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  Nigeria
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                Estimated delivery:{" "}
                {product.deliveryEstimate}
              </p>
            </div>

            <div className="mt-10">
              <h3 className="mb-3 font-semibold text-slate-900">
                Quantity
              </h3>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-xl text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  -
                </button>

                <span className="text-2xl text-slate-900">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(current + 1, stock)
                    )
                  }
                  disabled={
                    stock < 1 || quantity >= stock
                  }
                  className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-xl text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button
                type="button"
                onClick={addItemToCart}
                disabled={stock < 1}
                className="flex-1 rounded-xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Add To Cart
              </button>

              <button
                type="button"
                onClick={buyNow}
                disabled={stock < 1}
                className="rounded-xl bg-slate-900 px-8 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                🚚 Delivery estimate shown
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                🔒 Secure payments
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                🏪 Identified seller
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                💬 Seller support
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default ProductDetails; 