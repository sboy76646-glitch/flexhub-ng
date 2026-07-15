import { LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";

const databaseIdPattern = /^[a-f\d]{24}$/i;

function Checkout() {
  const { cartItems, cartTotal } = useCart();
  const { isAuthenticated, token, user } = useAuth();
  const [pendingOrder, setPendingOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const canUseMarketplacePayment = cartItems.every((item) => databaseIdPattern.test(String(item.id)));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  function openWhatsAppOrder(form) {
    const items = cartItems
      .map((item) => `• ${item.name} x${item.quantity} — ₦${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");
    const message = [
      "Hello FlexHub NG, I would like to confirm this marketplace order:",
      "",
      items,
      "",
      `Subtotal: ₦${cartTotal.toLocaleString()}`,
      `Name: ${form.get("firstName")} ${form.get("lastName")}`,
      `Phone: ${form.get("phone")}`,
      `Delivery: ${form.get("address")}, ${form.get("city")}, ${form.get("state")}`,
      "",
      "Please confirm availability, delivery cost and payment details.",
    ].join("\n");

    window.open(`https://wa.me/2349113393303?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  async function startPayment(orderId) {
    const payment = await apiRequest(`/api/payments/orders/${orderId}/initialize`, {
      method: "POST",
      token,
    });
    window.location.assign(payment.authorizationUrl);
  }

  async function handleCheckout(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (!canUseMarketplacePayment) {
      openWhatsAppOrder(form);
      return;
    }

    setSubmitting(true);
    setPaymentError("");

    try {
      if (pendingOrder) {
        await startPayment(pendingOrder._id);
        return;
      }

      const data = await apiRequest("/api/orders", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shippingAddress: {
            fullName: `${form.get("firstName")} ${form.get("lastName")}`.trim(),
            phone: form.get("phone"),
            address: form.get("address"),
            city: form.get("city"),
            state: form.get("state"),
          },
        }),
      });

      setPendingOrder(data.order);
      await startPayment(data.order._id);
    } catch (error) {
      setPaymentError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayedTotal = pendingOrder?.total ?? cartTotal;

  return (
    <Layout>
      <section className="min-h-screen bg-slate-100 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Secure checkout</p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Where should we deliver?</h1>
            <p className="mt-3 text-slate-600">Review your details once; FlexHub NG checks every live price again on the server.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><ShieldCheck size={21} /></div><div><h2 className="text-xl font-black">Delivery information</h2><p className="text-sm text-slate-500">Shared only with the sellers fulfilling this order.</p></div></div>

              <form id="checkout-form" onSubmit={handleCheckout} className="mt-7 grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">First name<input type="text" name="firstName" defaultValue={user.firstName || ""} required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="grid gap-2 text-sm font-bold">Last name<input type="text" name="lastName" defaultValue={user.lastName || ""} required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="grid gap-2 text-sm font-bold md:col-span-2">Email address<input type="email" name="email" defaultValue={user.email || ""} readOnly className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-500" /></label>
                <label className="grid gap-2 text-sm font-bold md:col-span-2">Phone number<input type="tel" name="phone" defaultValue={user.phone || ""} required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" /></label>
                <label className="grid gap-2 text-sm font-bold">State<input type="text" name="state" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="Lagos" /></label>
                <label className="grid gap-2 text-sm font-bold">City / area<input type="text" name="city" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500" placeholder="Ikeja" /></label>
                <label className="grid gap-2 text-sm font-bold md:col-span-2">Street address<textarea rows="4" name="address" required className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-7 outline-none focus:border-orange-500" placeholder="House number, street and a helpful landmark" /></label>
              </form>

              {!canUseMarketplacePayment && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  This cart contains an original catalogue sample, so it will use the assisted WhatsApp checkout. Seller-uploaded products use secure online payment.
                </div>
              )}
            </div>

            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:sticky lg:top-28 sm:p-8">
              <h2 className="text-2xl font-black">Your order</h2>
              <div className="mt-6 grid gap-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-slate-800 pb-4">
                    <img src={item.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{item.name}</p><p className="mt-1 text-sm text-slate-400">{item.storeName} · Qty {item.quantity}</p></div>
                    <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between text-slate-300"><span>Products</span><span>{money(cartTotal)}</span></div>
              <div className="mt-3 flex justify-between text-slate-300"><span>Delivery</span><span>{pendingOrder ? money(pendingOrder.deliveryFee) : "Confirmed before payment"}</span></div>
              <div className="my-6 border-t border-slate-800" />
              <div className="flex items-end justify-between"><span className="font-bold">Total</span><span className="text-3xl font-black text-orange-400">{money(displayedTotal)}</span></div>

              {paymentError && <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-200">{paymentError}{pendingOrder && " Your order is saved; use the button below to try payment again."}</div>}

              <button type="submit" form="checkout-form" disabled={submitting} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-lg font-black text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">
                {canUseMarketplacePayment ? <LockKeyhole size={19} /> : <MessageCircle size={19} />}
                {submitting ? "Preparing payment…" : pendingOrder ? "Try secure payment again" : canUseMarketplacePayment ? "Confirm and pay securely" : "Request order on WhatsApp"}
              </button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">Payments open on Paystack. FlexHub NG never receives your card or PIN details.</p>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function money(value = 0) {
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

export default Checkout;
