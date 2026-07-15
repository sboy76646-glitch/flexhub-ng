import { useEffect, useState } from "react";
import { BadgeCheck, MapPin, Store } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../lib/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const sampleProduct = products.find(
    (item) => item.id === Number(id)
  );
  const [product, setProduct] = useState(sampleProduct || null);
  const [loading, setLoading] = useState(!sampleProduct);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (sampleProduct) return undefined;
    let cancelled = false;

    apiRequest(`/api/products/${id}`)
      .then((data) => {
        if (!cancelled) setProduct(data.product);
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, sampleProduct]);

  if (loading) {
    return <Layout><div className="flex min-h-[70vh] items-center justify-center bg-slate-50 text-slate-500">Loading product…</div></Layout>;
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center text-white text-3xl">
          Product Not Found
        </div>
      </Layout>
    );
  }

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

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">

          {/* Product Image */}

          <div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <img
                src={product.image}
                alt={product.name}
                decoding="async"
                className="w-full rounded-2xl"
              />

            </div>

          </div>

          {/* Product Info */}

          <div>

            <span className="bg-orange-500 text-white px-4 py-2 rounded-full">
              {product.category}
            </span>

            <h1 className="mt-6 text-5xl font-bold text-slate-950">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-5">

              <span className="text-yellow-500 text-xl">
                {product.rating ? `⭐ ${product.rating}` : "New listing"}
              </span>

              <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
              </span>

            </div>

            <div className="flex gap-5 items-center mt-8">

              <h2 className="text-5xl font-bold text-orange-600">
                ₦{product.price.toLocaleString()}
              </h2>

              {product.oldPrice && <h3 className="text-2xl line-through text-gray-500">₦{product.oldPrice.toLocaleString()}</h3>}

            </div>

            <p className="mt-8 leading-8 text-slate-600">{product.description}</p>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sold by</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <Link to={`/stores/${product.storeId}`} className="flex items-center gap-2 font-bold text-slate-950 hover:text-orange-600">
                  <Store size={19} className="text-orange-400" />
                  {product.storeName}
                  {product.sellerVerified && <BadgeCheck size={18} className="text-orange-400" />}
                </Link>
                <span className="flex items-center gap-2 text-sm text-slate-500"><MapPin size={16} /> Nigeria</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Estimated delivery: {product.deliveryEstimate}</p>
            </div>

            {/* Quantity */}

            <div className="mt-10">

              <h3 className="mb-3 font-semibold text-slate-900">
                Quantity
              </h3>

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    quantity > 1 &&
                    setQuantity(quantity - 1)
                  }
                  className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-xl text-slate-900"
                >
                  -
                </button>

                <span className="text-2xl text-slate-900">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, product.stock))
                  }
                  className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-xl text-slate-900"
                >
                  +
                </button>

              </div>

            </div>

            {/* Buttons */}

            <div className="flex gap-4 mt-12">

              <button
                onClick={addItemToCart}
                disabled={product.stock < 1}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl text-lg font-bold transition disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                Add To Cart
              </button>

              <button onClick={buyNow} disabled={product.stock < 1} className="rounded-xl bg-slate-900 px-8 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500">
                Buy Now
              </button>

            </div>

            {/* Features */}

            <div className="grid grid-cols-2 gap-6 mt-14">

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                🚚 Delivery estimate shown
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-700">
                🔒 Secure Payments
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
