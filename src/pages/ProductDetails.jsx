import { useState } from "react";
import { useParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import products from "../data/products";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const [quantity, setQuantity] = useState(1);

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

  return (
    <Layout>

      <section className="bg-slate-950 min-h-screen py-16">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">

          {/* Product Image */}

          <div>

            <div className="bg-slate-900 rounded-3xl p-6">

              <img
                src={product.image}
                alt={product.name}
                className="w-full rounded-2xl"
              />

            </div>

          </div>

          {/* Product Info */}

          <div>

            <span className="bg-emerald-500 text-white px-4 py-2 rounded-full">
              {product.category}
            </span>

            <h1 className="text-5xl font-bold text-white mt-6">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-5">

              <span className="text-yellow-400 text-xl">
                ⭐ {product.rating}
              </span>

              <span className="text-green-400">
                In Stock
              </span>

            </div>

            <div className="flex gap-5 items-center mt-8">

              <h2 className="text-5xl font-bold text-emerald-400">
                ₦{product.price.toLocaleString()}
              </h2>

              <h3 className="text-2xl line-through text-gray-500">
                ₦{product.oldPrice.toLocaleString()}
              </h3>

            </div>

            <p className="text-gray-300 mt-8 leading-8">
              Experience premium quality and durability with this
              product. Carefully selected by FlexHub NG to provide
              excellent value, fast delivery and guaranteed customer
              satisfaction.
            </p>

            {/* Quantity */}

            <div className="mt-10">

              <h3 className="text-white font-semibold mb-3">
                Quantity
              </h3>

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    quantity > 1 &&
                    setQuantity(quantity - 1)
                  }
                  className="bg-slate-800 w-12 h-12 rounded-xl text-white text-xl"
                >
                  -
                </button>

                <span className="text-white text-2xl">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  className="bg-slate-800 w-12 h-12 rounded-xl text-white text-xl"
                >
                  +
                </button>

              </div>

            </div>

            {/* Buttons */}

            <div className="flex gap-4 mt-12">

              <button
                onClick={addItemToCart}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl text-lg font-bold transition"
              >
                Add To Cart
              </button>

              <button className="px-8 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition">
                Buy Now
              </button>

            </div>

            {/* Features */}

            <div className="grid grid-cols-2 gap-6 mt-14">

              <div className="bg-slate-900 rounded-xl p-5">
                🚚 Fast Nationwide Delivery
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                🔒 Secure Payments
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                ✅ Quality Guaranteed
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                ↩️ 7-Day Returns
              </div>

            </div>

          </div>

        </div>

      </section>

    </Layout>
  );
}

export default ProductDetails; 