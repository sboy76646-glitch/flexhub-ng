import { Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const { cartItems, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <Layout>
      <section className="bg-slate-950 min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-bold text-white mb-12">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Delivery Form */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                Delivery Information
              </h2>

              <form className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none"
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none md:col-span-2"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none md:col-span-2"
                />

                <input
                  type="text"
                  placeholder="State"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none"
                />

                <input
                  type="text"
                  placeholder="City"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none"
                />

                <textarea
                  rows="4"
                  placeholder="Delivery Address"
                  required
                  className="bg-slate-800 text-white p-4 rounded-xl outline-none md:col-span-2"
                />
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-900 rounded-2xl p-8 h-fit sticky top-28">
              <h2 className="text-2xl font-bold text-white mb-6">
                Order Summary
              </h2>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-gray-300 mb-4"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="border-t border-slate-700 my-6" />

              <div className="flex justify-between text-gray-300 mb-4">
                <span>Delivery</span>
                <span className="text-emerald-400">FREE</span>
              </div>

              <div className="flex justify-between text-white text-2xl font-bold">
                <span>Total</span>

                <span className="text-emerald-400">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl text-lg font-bold text-white transition"
              >
                Continue to Payment
              </button>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Checkout; 