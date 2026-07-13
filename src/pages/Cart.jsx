import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    cartTotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <Layout>
        <section className="bg-slate-950 min-h-screen flex items-center justify-center px-6">
          <div className="text-center">

            <div className="text-8xl mb-6">🛒</div>

            <h1 className="text-4xl font-bold text-white">
              Your Cart is Empty
            </h1>

            <p className="text-gray-400 mt-4">
              Add some amazing products to get started.
            </p>

            <Link
              to="/shop"
              className="inline-block mt-8 bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl text-white font-semibold transition"
            >
              Continue Shopping
            </Link>

          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>

      <section className="bg-slate-950 min-h-screen py-16">

        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-bold text-white mb-12">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Cart Items */}

            <div className="lg:col-span-2 space-y-6">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-slate-900 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-36 h-36 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <h2 className="text-2xl font-bold text-white">
                      {item.name}
                    </h2>

                    <p className="text-emerald-400 mt-2">
                      {item.category}
                    </p>

                    <p className="text-3xl font-bold text-emerald-400 mt-4">
                      ₦{item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 mt-6">

                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-lg text-white"
                      >
                        -
                      </button>

                      <span className="text-white text-xl font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-lg text-white"
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <div className="flex flex-col items-end gap-4">

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg text-white transition"
                    >
                      Remove
                    </button>

                    <h3 className="text-2xl font-bold text-white">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </h3>

                  </div>

                </div>

              ))}

            </div>

            {/* Summary */}

            <div>

              <div className="bg-slate-900 rounded-2xl p-8 sticky top-28">

                <h2 className="text-3xl font-bold text-white mb-8">
                  Order Summary
                </h2>

                <div className="flex justify-between text-gray-300 mb-4">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>

                <div className="flex justify-between text-gray-300 mb-4">
                  <span>Delivery</span>
                  <span className="text-emerald-400">
                    FREE
                  </span>
                </div>

                <div className="border-t border-slate-700 my-6"></div>

                <div className="flex justify-between">

                  <span className="text-white text-xl font-bold">
                    Total
                  </span>

                  <span className="text-emerald-400 text-3xl font-bold">
                    ₦{cartTotal.toLocaleString()}
                  </span>

                </div>

                <Link
                  to="/checkout"
                  className="block w-full mt-8 bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl text-lg font-bold text-white text-center transition"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/shop"
                  className="block text-center mt-5 text-emerald-400 hover:text-emerald-300"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </Layout>
  );
}

export default Cart; 