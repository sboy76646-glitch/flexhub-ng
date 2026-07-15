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
        <section className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
          <div className="text-center">

            <div className="text-8xl mb-6">🛒</div>

            <h1 className="text-4xl font-bold text-slate-950">
              Your Cart is Empty
            </h1>

            <p className="mt-4 text-slate-600">
              Add some amazing products to get started.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-block rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600"
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

      <section className="min-h-screen bg-slate-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <h1 className="mb-12 text-5xl font-bold text-slate-950">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Cart Items */}

            <div className="lg:col-span-2 space-y-6">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row"
                >

                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-36 h-36 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <h2 className="text-2xl font-bold text-slate-950">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-orange-600">{item.storeName || item.category}</p>

                    <p className="mt-4 text-3xl font-bold text-orange-600">
                      ₦{item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 mt-6">

                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="h-10 w-10 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200"
                      >
                        -
                      </button>

                      <span className="text-xl font-semibold text-slate-950">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="h-10 w-10 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200"
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

                    <h3 className="text-2xl font-bold text-slate-950">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </h3>

                  </div>

                </div>

              ))}

            </div>

            {/* Summary */}

            <div>

              <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

                <h2 className="mb-8 text-3xl font-bold text-slate-950">
                  Order Summary
                </h2>

                <div className="mb-4 flex justify-between text-slate-700">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>

                <div className="mb-4 flex justify-between text-slate-700">
                  <span>Delivery</span>
                  <span className="text-slate-600">At checkout</span>
                </div>

                <div className="my-6 border-t border-slate-200"></div>

                <div className="flex justify-between">

                  <span className="text-xl font-bold text-slate-950">
                    Total
                  </span>

                  <span className="text-3xl font-bold text-orange-600">
                    ₦{cartTotal.toLocaleString()}
                  </span>

                </div>

                <Link
                  to="/checkout"
                  className="block w-full mt-8 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl text-lg font-bold text-white text-center transition"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/shop"
                  className="mt-5 block text-center text-orange-600 hover:text-orange-700"
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
