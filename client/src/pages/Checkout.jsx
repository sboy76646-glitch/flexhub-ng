import { Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const { cartItems, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function handleOrderRequest(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const items = cartItems
      .map((item) => `• ${item.name} x${item.quantity} — ₦${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");
    const message = [
      "Hello FlexHub NG 🇳🇬, I would like to confirm this marketplace order:",
      "",
      items,
      "",
      `Subtotal: ₦${cartTotal.toLocaleString()}`,
      `Name: ${form.get("firstName")} ${form.get("lastName")}`,
      `Phone: ${form.get("phone")}`,
      `Delivery: ${form.get("address")}, ${form.get("city")}, ${form.get("state")}`,
      "",
      "Please confirm delivery cost and payment details.",
    ].join("\n");

    window.open(`https://wa.me/2349113393303?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6">

          <h1 className="mb-12 text-5xl font-bold text-slate-950">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-10">

            {/* Delivery Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:col-span-2">
              <h2 className="mb-8 text-2xl font-bold text-slate-950">
                Delivery Information
              </h2>

              <form id="checkout-form" onSubmit={handleOrderRequest} className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500"
                />

                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500 md:col-span-2"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500 md:col-span-2"
                />

                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500"
                />

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500"
                />

                <textarea
                  rows="4"
                  name="address"
                  placeholder="Delivery Address"
                  required
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-orange-500 md:col-span-2"
                />
              </form>
            </div>

            {/* Order Summary */}
            <div className="sticky top-28 h-fit rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-950">
                Order Summary
              </h2>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 flex justify-between gap-4 text-slate-700"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span>
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              <div className="my-6 border-t border-slate-200" />

              <div className="mb-4 flex justify-between text-slate-700">
                <span>Delivery</span>
                <span className="text-slate-600">Calculated after address</span>
              </div>

              <div className="flex justify-between text-2xl font-bold text-slate-950">
                <span>Subtotal</span>

                <span className="text-orange-600">
                  ₦{cartTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full mt-8 bg-orange-500 hover:bg-orange-600 py-4 rounded-xl text-lg font-bold text-white transition"
              >
                Confirm order on WhatsApp
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">Delivery cost and payment details are confirmed before you pay.</p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

export default Checkout;
