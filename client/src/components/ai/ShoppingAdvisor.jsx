import {
  Bot,
  Check,
  LoaderCircle,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../lib/api";

const quickPrompts = [
  "I need a good phone below ₦250,000 with a strong camera.",
  "Show me a trustworthy product with a warranty and returns.",
  "What is the best verified value available right now?",
];

function money(value = 0) {
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function conditionLabel(value) {
  return String(value || "not provided").replaceAll("_", " ");
}

function RecommendationCard({ item }) {
  const product = item.product || {};

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
      <div className="flex gap-4">
        <img
          src={product.image}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-black text-slate-950">{product.name}</p>
              <p className="mt-1 text-sm font-black text-orange-600">
                {money(product.price)}
              </p>
            </div>

            {product.flexHubVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                <ShieldCheck size={13} /> FlexHub Verified
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
          <p className="mt-2 text-xs font-semibold capitalize text-slate-500">
            {conditionLabel(product.condition)} · {product.warranty || "Warranty not provided"} · Seller score {product.sellerTrust?.score ?? 0}/100
          </p>

          <Link
            to={`/product/${product.id}`}
            className="mt-3 inline-flex text-sm font-black text-orange-600 hover:text-orange-700"
          >
            View product →
          </Link>
        </div>
      </div>
    </article>
  );
}

function ComparisonCard({ item }) {
  const product = item.product || {};

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-black text-slate-950">{product.name}</p>
          <p className="mt-1 font-black text-orange-600">{money(product.price)}</p>
        </div>
        <Link to={`/product/${product.id}`} className="text-sm font-bold text-orange-600">
          Open
        </Link>
      </div>

      {item.strengths?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Strengths</p>
          <ul className="mt-2 grid gap-2 text-sm text-slate-600">
            {item.strengths.map((strength) => (
              <li key={strength} className="flex gap-2">
                <Check className="mt-0.5 shrink-0 text-emerald-600" size={15} />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.tradeoffs?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">Trade-offs</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {item.tradeoffs.map((tradeoff) => <li key={tradeoff}>{tradeoff}</li>)}
          </ul>
        </div>
      )}

      <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm font-semibold leading-6 text-slate-700">
        {item.verdict}
      </p>
    </article>
  );
}

function ShoppingAdvisor({ products = [] }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const selectableProducts = useMemo(
    () => products.filter((product) => product?.id && Number(product.stock || 0) > 0),
    [products]
  );

  function toggleProduct(productId) {
    setError("");
    setSelectedIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }

      if (current.length >= 3) {
        setError("Choose up to three products for a clear comparison.");
        return current;
      }

      return [...current, productId];
    });
  }

  async function askFlexGuide(text, comparisonIds = []) {
    const cleaned = text.trim();
    if (!cleaned || busy) return;

    const previousMessages = messages.slice(-6);
    const nextUserMessage = { role: "user", content: cleaned };
    setMessages((current) => [...current, nextUserMessage]);
    setMessage("");
    setError("");
    setBusy(true);

    try {
      const data = await apiRequest("/api/ai/shop-adviser", {
        method: "POST",
        timeout: 60_000,
        body: JSON.stringify({
          message: cleaned,
          history: previousMessages,
          selectedProductIds: comparisonIds,
        }),
      });
      const assistantText = [data.answer, data.followUpQuestion]
        .filter(Boolean)
        .join("\n\n");

      setMessages((current) => [
        ...current,
        { role: "assistant", content: assistantText },
      ]);
      setResult(data);
      setCompareOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function submitQuestion(event) {
    event.preventDefault();
    askFlexGuide(message);
  }

  function compareProducts() {
    if (selectedIds.length < 2) {
      setError("Choose at least two products to compare.");
      return;
    }

    const names = selectableProducts
      .filter((product) => selectedIds.includes(product.id))
      .map((product) => product.name);
    askFlexGuide(
      `Compare these products for me and recommend the best value: ${names.join(", ")}.`,
      selectedIds
    );
  }

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl" aria-labelledby="flexguide-title">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet-300">
            <Sparkles size={14} /> FlexGuide AI
          </span>

          <h2 id="flexguide-title" className="mt-5 text-3xl font-black sm:text-4xl">
            Describe what you need. Get a catalogue-grounded shortlist.
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Ask naturally about budget, use, warranty, seller trust or delivery. FlexGuide only recommends approved products currently listed on FlexHub.
          </p>

          <button
            type="button"
            onClick={() => setCompareOpen((current) => !current)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-bold text-white hover:border-violet-400 hover:text-violet-300"
          >
            <Scale size={18} /> Compare up to 3 products
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Advice only. FlexGuide cannot place orders, take payment or verify sellers.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-4 text-slate-900 sm:p-5">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                  <Bot size={21} />
                </span>
                <div>
                  <p className="font-black">Hi, I’m FlexGuide.</p>
                  <p className="text-sm text-slate-500">What are you shopping for today?</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => askFlexGuide(prompt)}
                    disabled={busy}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold leading-6 text-slate-700 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"
                  >
                    “{prompt}”
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4" aria-live="polite">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`max-w-[92%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {item.content}
                </div>
              ))}
              {busy && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm">
                  <LoaderCircle className="animate-spin" size={17} /> Checking the live catalogue…
                </div>
              )}
            </div>
          )}

          <form onSubmit={submitQuestion} className="mt-4 flex gap-2">
            <label className="sr-only" htmlFor="flexguide-question">Ask FlexGuide</label>
            <input
              id="flexguide-question"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength="800"
              disabled={busy}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 disabled:bg-slate-100"
              placeholder="e.g. A reliable laptop below ₦600,000"
            />
            <button
              type="submit"
              disabled={busy || !message.trim()}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send question"
            >
              {busy ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}
            </button>
          </form>

          {error && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      {compareOpen && (
        <div className="border-t border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-black">Choose products to compare</h3>
              <p className="mt-1 text-sm text-slate-400">Select two or three. FlexGuide will compare only catalogue facts.</p>
            </div>
            <button
              type="button"
              onClick={compareProducts}
              disabled={busy || selectedIds.length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700 disabled:opacity-40"
            >
              <Scale size={18} /> Compare selected ({selectedIds.length})
            </button>
          </div>

          <div className="mt-5 grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {selectableProducts.map((product) => {
              const selected = selectedIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-violet-400 bg-violet-400/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-500"
                  }`}
                >
                  <img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{product.name}</span>
                    <span className="mt-1 block text-sm text-slate-400">{money(product.price)}</span>
                  </span>
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-violet-400 bg-violet-500" : "border-slate-600"}`}>
                    {selected && <Check size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {result && (
        <div className="border-t border-slate-800 bg-slate-100 p-6 text-slate-900 sm:p-8">
          {result.recommendations?.length > 0 && (
            <div>
              <h3 className="text-2xl font-black">FlexGuide shortlist</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {result.recommendations.map((item) => (
                  <RecommendationCard key={item.productId} item={item} />
                ))}
              </div>
            </div>
          )}

          {result.comparison?.length > 0 && (
            <div className={result.recommendations?.length > 0 ? "mt-8" : ""}>
              <h3 className="text-2xl font-black">Side-by-side guidance</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {result.comparison.map((item) => (
                  <ComparisonCard key={item.productId} item={item} />
                ))}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs leading-5 text-slate-500">{result.disclaimer}</p>
        </div>
      )}
    </section>
  );
}

export default ShoppingAdvisor;
