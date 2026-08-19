import {
  CheckCircle2,
  Copy,
  ExternalLink,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const [bankTransferAvailable, setBankTransferAvailable] =
    useState(false);

  const [bankTransfer, setBankTransfer] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const checkoutKeyRef = useRef(
    crypto.randomUUID()
  );

  const canUseMarketplacePayment = cartItems.every(
    (item) =>
      databaseIdPattern.test(String(item.id))
  );

  useEffect(() => {
    let mounted = true;

    apiRequest("/api/bank-transfers/config")
      .then((data) => {
        if (mounted) {
          setBankTransferAvailable(
            data.enabled === true
          );
        }
      })
      .catch(() => {
        if (mounted) {
          setBankTransferAvailable(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: "/checkout" }}
      />
    );
  }

  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  async function startPaystackPayment(orderId) {
    const payment = await apiRequest(
      `/api/payments/orders/${orderId}/initialize`,
      {
        method: "POST",
        token,
      }
    );

    if (!payment.authorizationUrl) {
      throw new Error(
        "Paystack did not return a payment link."
      );
    }

    window.location.assign(
      payment.authorizationUrl
    );
  }

  async function startBankTransfer(orderId) {
    const data = await apiRequest(
      `/api/bank-transfers/orders/${orderId}`,
      {
        method: "POST",
        token,
      }
    );

    if (!data?.payment || !data?.instructions) {
      throw new Error(
        "FlexHub could not prepare the bank-transfer instructions."
      );
    }

    setBankTransfer(data);

    return data;
  }

  function buildFallbackWhatsAppMessage(form) {
    const items = cartItems
      .map(
        (item) =>
          `• ${item.name} x${item.quantity}`
      )
      .join("\n");

    return [
      "Hello FlexHub NG 👋",
      "",
      "I would like to place a marketplace order.",
      "",
      items,
      "",
      `Customer: ${form.get(
        "firstName"
      )} ${form.get("lastName")}`,
      `Phone: ${form.get("phone")}`,
      `Delivery: ${form.get(
        "address"
      )}, ${form.get("city")}, ${form.get(
        "state"
      )}`,
      "",
      "Please assist me with the order.",
    ].join("\n");
  }

  function openFallbackWhatsApp(form) {
    const number = "2349113393303";

    const message =
      buildFallbackWhatsAppMessage(form);

    const url = `https://wa.me/${number}?text=${encodeURIComponent(
      message
    )}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function openPaymentWhatsApp() {
    if (!bankTransfer?.whatsappUrl) {
      toast.error(
        "WhatsApp handoff is not configured yet."
      );

      return;
    }

    window.open(
      bankTransfer.whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copyPaymentReference() {
    const reference =
      bankTransfer?.instructions
        ?.paymentReference;

    if (!reference) return;

    try {
      await navigator.clipboard.writeText(
        reference
      );

      toast.success(
        "Payment reference copied."
      );
    } catch {
      toast.error(
        "Could not copy the reference."
      );
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    if (!canUseMarketplacePayment) {
      openFallbackWhatsApp(form);
      return;
    }

    setSubmitting(true);
    setPaymentError("");

    try {
      let order = pendingOrder;

      /*
       * Create the order only once.
       * The same idempotency key prevents duplicate
       * orders if the customer clicks multiple times.
       */
      if (!order) {
        const data = await apiRequest(
          "/api/orders",
          {
            method: "POST",
            token,
            body: JSON.stringify({
              items: cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),

              shippingAddress: {
                fullName:
                  `${form.get(
                    "firstName"
                  )} ${form.get(
                    "lastName"
                  )}`.trim(),

                phone: form.get("phone"),
                address: form.get("address"),
                city: form.get("city"),
                state: form.get("state"),
              },
            }),

            headers: {
              "Idempotency-Key":
                checkoutKeyRef.current,
            },
          }
        );

        order = data.order;

        setPendingOrder(order);
      }

      /*
       * PAYSTACK
       */
      if (paymentMethod === "paystack") {
        await startPaystackPayment(order._id);
        return;
      }

      /*
       * BANK TRANSFER
       */
      const transfer =
        await startBankTransfer(order._id);

      /*
       * Do NOT automatically open WhatsApp.
       *
       * We show the authoritative payment
       * instructions first so the customer can
       * verify the amount/reference before leaving
       * FlexHub.
       */
      if (transfer?.whatsappUrl) {
        toast.success(
          "Payment instructions ready."
        );
      }
    } catch (error) {
      const message =
        error?.message ||
        "Unable to prepare your payment.";

      setPaymentError(message);

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayedTotal =
    pendingOrder?.total ?? cartTotal;

  const bankInstructions =
    bankTransfer?.instructions;

  const bankTransferReady =
    paymentMethod === "bank_transfer" &&
    Boolean(bankInstructions);

  return (
    <Layout>
      <section className="min-h-screen bg-slate-100 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Secure checkout
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Where should we deliver?
            </h1>

            <p className="mt-3 text-slate-600">
              Review your details once; FlexHub NG
              checks every live price again on the
              server.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* DELIVERY */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    Delivery information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Shared only with the sellers
                    fulfilling this order.
                  </p>
                </div>
              </div>

              <form
                id="checkout-form"
                onSubmit={handleCheckout}
                className="mt-7 grid gap-5 md:grid-cols-2"
              >
                <label className="grid gap-2 text-sm font-bold">
                  First name

                  <input
                    type="text"
                    name="firstName"
                    defaultValue={
                      user?.firstName || ""
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  Last name

                  <input
                    type="text"
                    name="lastName"
                    defaultValue={
                      user?.lastName || ""
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Email address

                  <input
                    type="email"
                    name="email"
                    defaultValue={
                      user?.email || ""
                    }
                    readOnly
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Phone number

                  <input
                    type="tel"
                    name="phone"
                    defaultValue={
                      user?.phone || ""
                    }
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  State

                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="Lagos"
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold">
                  City / area

                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Ikeja"
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-orange-500"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Street address

                  <textarea
                    rows="4"
                    name="address"
                    required
                    placeholder="House number, street and a helpful landmark"
                    className="rounded-xl border border-slate-300 px-4 py-3 font-normal leading-7 outline-none focus:border-orange-500"
                  />
                </label>
              </form>

              {!canUseMarketplacePayment && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                  This cart contains an original
                  catalogue sample, so it will use
                  the assisted WhatsApp checkout.
                </div>
              )}
            </div>

            {/* ORDER */}
            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:sticky lg:top-28 sm:p-8">
              <h2 className="text-2xl font-black">
                Your order
              </h2>

              <div className="mt-6 grid gap-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 border-b border-slate-800 pb-4"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-14 w-14 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.storeName} · Qty{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <span className="font-bold">
                      {money(
                        item.price *
                          item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between text-slate-300">
                <span>Products</span>
                <span>
                  {money(cartTotal)}
                </span>
              </div>

              <div className="mt-3 flex justify-between text-slate-300">
                <span>Delivery</span>

                <span>
                  {pendingOrder
                    ? money(
                        pendingOrder.deliveryFee
                      )
                    : "Confirmed before payment"}
                </span>
              </div>

              <div className="my-6 border-t border-slate-800" />

              <div className="flex items-end justify-between">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-3xl font-black text-orange-400">
                  {money(displayedTotal)}
                </span>
              </div>

              {/* PAYMENT METHOD */}
              {canUseMarketplacePayment &&
                bankTransferAvailable &&
                !bankTransfer && (
                  <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-900 p-1 text-sm font-bold">
                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "paystack"
                        )
                      }
                      className={`rounded-lg px-3 py-2 transition ${
                        paymentMethod ===
                        "paystack"
                          ? "bg-white text-slate-950"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Paystack
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          "bank_transfer"
                        )
                      }
                      className={`rounded-lg px-3 py-2 transition ${
                        paymentMethod ===
                        "bank_transfer"
                          ? "bg-white text-slate-950"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Bank transfer
                    </button>
                  </div>
                )}

              {/* BANK TRANSFER INSTRUCTIONS */}
              {bankTransferReady && (
                <div className="mt-5 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={18}
                      className="text-orange-400"
                    />

                    <p className="font-black text-orange-300">
                      Payment instructions ready
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">
                        Bank
                      </p>

                      <p className="font-bold">
                        {bankInstructions.bankName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Account name
                      </p>

                      <p className="font-bold">
                        {
                          bankInstructions.accountName
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Account number
                      </p>

                      <p className="font-bold tracking-wide">
                        {
                          bankInstructions.accountNumber
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Amount
                      </p>

                      <p className="text-xl font-black text-orange-300">
                        {money(
                          bankInstructions.amount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Payment reference
                      </p>

                      <button
                        type="button"
                        onClick={
                          copyPaymentReference
                        }
                        className="mt-1 flex w-full items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-left font-black"
                      >
                        <span>
                          {
                            bankInstructions.paymentReference
                          }
                        </span>

                        <Copy
                          size={16}
                          className="text-slate-400"
                        />
                      </button>
                    </div>

                    <div className="rounded-lg bg-slate-900/70 p-3 text-xs leading-5 text-slate-300">
                      Expires:{" "}
                      {new Date(
                        bankInstructions.expiresAt
                      ).toLocaleString("en-NG")}
                      <br />
                      Use the payment reference
                      exactly as shown.
                    </div>
                  </div>

                  {bankTransfer.whatsappUrl && (
                    <button
                      type="button"
                      onClick={
                        openPaymentWhatsApp
                      }
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-black text-white transition hover:bg-green-600"
                    >
                      <MessageCircle
                        size={19}
                      />

                      Continue on WhatsApp

                      <ExternalLink
                        size={16}
                      />
                    </button>
                  )}

                  <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                    WhatsApp will open with your
                    FlexHub payment reference already
                    attached.
                  </p>
                </div>
              )}

              {/* ERROR */}
              {paymentError && (
                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm leading-6 text-red-200">
                  {paymentError}

                  {pendingOrder &&
                    " Your order is saved; you can try the payment again."}
                </div>
              )}

              {/* MAIN CHECKOUT BUTTON */}
              {!bankTransferReady && (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-lg font-black text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60"
                >
                  {canUseMarketplacePayment ? (
                    <LockKeyhole size={19} />
                  ) : (
                    <MessageCircle size={19} />
                  )}

                  {submitting
                    ? "Preparing payment…"
                    : pendingOrder
                    ? paymentMethod ===
                      "bank_transfer"
                      ? "Prepare bank transfer"
                      : "Try secure payment again"
                    : canUseMarketplacePayment
                    ? paymentMethod ===
                      "bank_transfer"
                      ? "Create bank-transfer order"
                      : "Confirm and pay securely"
                    : "Request order on WhatsApp"}
                </button>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                {paymentMethod ===
                "bank_transfer"
                  ? "Your bank transfer is only marked as paid after FlexHub verifies the incoming transaction."
                  : "Payments open on Paystack. FlexHub NG never receives your card or PIN details."}
              </p>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function money(value = 0) {
  return `₦${Number(value).toLocaleString(
    "en-NG"
  )}`;
}

export default Checkout;