import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";

import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { apiRequest } from "../lib/api";

function PaymentCallback() {
  const { isAuthenticated, token } = useAuth();
  const { clearCart } = useCart();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const [result, setResult] = useState({ status: "verifying", message: "Confirming your payment with Paystack…" });

  useEffect(() => {
    if (!token || !reference) return undefined;
    let cancelled = false;

    apiRequest(`/api/payments/verify/${encodeURIComponent(reference)}`, { token })
      .then((data) => {
        if (cancelled) return;
        clearCart(false);
        setResult({ status: "success", message: data.message, order: data.order });
      })
      .catch((error) => {
        if (!cancelled) setResult({ status: "error", message: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [clearCart, reference, token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const isSuccess = result.status === "success";
  const isError = !reference || result.status === "error";

  return (
    <Layout>
      <section className="flex min-h-[75vh] items-center justify-center bg-slate-100 px-6 py-16 text-slate-900">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
          {isSuccess ? <CheckCircle2 className="mx-auto text-green-600" size={58} /> : isError ? <XCircle className="mx-auto text-red-600" size={58} /> : <LoaderCircle className="mx-auto animate-spin text-orange-500" size={58} />}
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-orange-600">FlexHub NG payment</p>
          <h1 className="mt-3 text-3xl font-black">{isSuccess ? "Payment confirmed" : isError ? "Payment needs attention" : "One moment"}</h1>
          <p className="mt-4 leading-7 text-slate-600">{!reference ? "The payment reference is missing. Please return to checkout or contact FlexHub NG support." : result.message}</p>
          {result.order && <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">Order {result.order.reference.slice(-8).toUpperCase()}</p>}
          <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/profile" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Go to your account</Link><Link to="/shop" className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">Continue shopping</Link></div>
        </div>
      </section>
    </Layout>
  );
}

export default PaymentCallback;
