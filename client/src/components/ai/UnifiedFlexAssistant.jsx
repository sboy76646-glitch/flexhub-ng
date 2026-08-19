import {
  Bot,
  ChevronDown,
  LoaderCircle,
  MessageCircle,
  PackageSearch,
  Send,
  ShoppingBag,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

const STORAGE_KEY = "flexhub-unified-ai-history";

const MODE_DETAILS = {
  shopping: {
    label: "Shop",
    icon: ShoppingBag,
    placeholder: "Ask for a product, budget or comparison…",
  },
  orders: {
    label: "Orders",
    icon: PackageSearch,
    placeholder: "Ask where your order is…",
  },
  seller: {
    label: "FlexWrite",
    icon: WandSparkles,
    placeholder: "Describe the real product you want to list…",
  },
};

const STARTERS = {
  shopping: [
    "Recommend a reliable phone below ₦250,000.",
    "What is the best verified value in the catalogue?",
    "Help me compare products for school and work.",
  ],
  orders: [
    "Where is my latest order?",
    "Has my order been shipped?",
    "Show me the tracking information for my latest order.",
  ],
  seller: [
    "Samsung A35, brand new, 8GB RAM, 256GB, black, sealed box, one-year shop warranty.",
    "Nike Air Force 1, white, size 43, new, original box, delivery available in Lagos.",
  ],
};

function safeReadHistory() {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.slice(-30) : [];
  } catch {
    return [];
  }
}

function assistantText(data, mode) {
  if (mode === "orders") {
    return [
      data.answer,
      data.recommendedAction ? `Next step: ${data.recommendedAction}` : "",
      data.matchedOrderReference ? `Matched order: ${data.matchedOrderReference}` : "",
    ].filter(Boolean).join("\n\n");
  }

  if (mode === "seller") {
    const draft = data.draft || {};
    return [
      draft.title ? `Suggested title\n${draft.title}` : "",
      draft.description ? `Suggested description\n${draft.description}` : "",
      draft.missingDetails?.length
        ? `Still confirm\n• ${draft.missingDetails.join("\n• ")}`
        : "",
    ].filter(Boolean).join("\n\n");
  }

  return [data.answer, data.followUpQuestion].filter(Boolean).join("\n\n");
}

function detectMode(message, fallbackMode, canUseOrders, canUseSeller) {
  const normalized = message.toLowerCase();

  if (
    canUseOrders &&
    /(my order|order status|tracking|track order|shipped|delivery|package|courier)/i.test(normalized)
  ) {
    return "orders";
  }

  if (
    canUseSeller &&
    /(write|rewrite|improve|generate).*(listing|title|description)|product listing|flexwrite/i.test(normalized)
  ) {
    return "seller";
  }

  return fallbackMode;
}

export default function UnifiedFlexAssistant() {
  const { token, user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [mode, setMode] = useState("shopping");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(safeReadHistory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const listRef = useRef(null);

  const canUseOrders = Boolean(token);
  const canUseSeller = Boolean(token && ["seller", "admin"].includes(user?.role));

  const availableModes = useMemo(
    () => [
      "shopping",
      ...(canUseOrders ? ["orders"] : []),
      ...(canUseSeller ? ["seller"] : []),
    ],
    [canUseOrders, canUseSeller]
  );

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  }, [messages]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setUnread(0);
    }
  }, [messages, open, busy]);

  const activeMode = availableModes.includes(mode) ? mode : "shopping";

  function openAssistant(nextMode = activeMode) {
    setMode(availableModes.includes(nextMode) ? nextMode : "shopping");
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  }

  async function submit(text = message) {
    const cleaned = text.trim();
    if (!cleaned || busy) return;

    const routedMode = detectMode(cleaned, activeMode, canUseOrders, canUseSeller);
    setMode(routedMode);
    setMessage("");
    setError("");
    setBusy(true);
    setMessages((current) => [
      ...current,
      { role: "user", mode: routedMode, content: cleaned },
    ]);

    try {
      let path = "/api/ai/shop-adviser";
      let body = {
        message: cleaned,
        history: messages
          .filter((item) => item.mode === "shopping")
          .slice(-6)
          .map((item) => ({ role: item.role, content: item.content })),
        selectedProductIds: [],
        pageContext: location.pathname,
      };

      if (routedMode === "orders") {
        path = "/api/ai/order-support";
        body = { question: cleaned };
      } else if (routedMode === "seller") {
        path = "/api/ai/seller/listing-draft";
        body = { notes: cleaned };
      }

      const data = await apiRequest(path, {
        method: "POST",
        token: routedMode === "shopping" ? "" : token,
        timeout: 60_000,
        body: JSON.stringify(body),
      });

      const content = assistantText(data, routedMode) || "I could not create a useful answer from that request.";
      setMessages((current) => [
        ...current,
        { role: "assistant", mode: routedMode, content },
      ]);
      if (!open) setUnread((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submit();
  }

  function clearConversation() {
    setMessages([]);
    setError("");
    sessionStorage.removeItem(STORAGE_KEY);
  }

  const CurrentModeIcon = MODE_DETAILS[activeMode].icon;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => openAssistant()}
          className="fixed bottom-5 right-5 z-[80] flex h-14 items-center gap-2 rounded-full bg-violet-600 px-4 font-black text-white shadow-2xl ring-4 ring-violet-500/20 transition hover:-translate-y-0.5 hover:bg-violet-500 sm:bottom-7 sm:right-7"
          aria-label="Open FlexGuide AI assistant"
        >
          <MessageCircle size={23} />
          <span className="hidden sm:inline">Ask FlexGuide</span>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-1 text-xs">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <aside
          className={`fixed z-[90] overflow-hidden border border-slate-700 bg-slate-950 text-white shadow-2xl transition-all sm:bottom-6 sm:right-6 sm:w-[390px] sm:rounded-[1.75rem] ${
            minimized
              ? "bottom-5 right-5 h-16 w-[calc(100%-2.5rem)] rounded-2xl sm:h-16"
              : "inset-0 h-[100dvh] w-full sm:inset-auto sm:h-[min(680px,calc(100dvh-3rem))]"
          }`}
          aria-label="FlexGuide AI assistant"
        >
          <header className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
            <button type="button" onClick={() => setMinimized(false)} className="flex min-w-0 items-center gap-3 text-left">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600"><Bot size={21} /></span>
              <span className="min-w-0">
                <span className="block truncate font-black">FlexGuide AI</span>
                <span className="block text-xs text-emerald-400">Online · Gemini powered</span>
              </span>
            </button>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setMinimized((value) => !value)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800" aria-label={minimized ? "Expand assistant" : "Minimize assistant"}><ChevronDown className={minimized ? "rotate-180" : ""} size={20} /></button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800" aria-label="Close assistant"><X size={20} /></button>
            </div>
          </header>

          {!minimized && (
            <div className="flex h-[calc(100%-4rem)] flex-col">
              <nav className="flex gap-2 overflow-x-auto border-b border-slate-800 p-3" aria-label="AI assistant modes">
                {availableModes.map((item) => {
                  const details = MODE_DETAILS[item];
                  const Icon = details.icon;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black ${activeMode === item ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"}`}
                    >
                      <Icon size={14} /> {details.label}
                    </button>
                  );
                })}
              </nav>

              <div ref={listRef} className="flex-1 overflow-y-auto p-4" aria-live="polite">
                {messages.length === 0 ? (
                  <div>
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                      <div className="flex items-center gap-2 font-black"><Sparkles className="text-violet-300" size={18} /> One assistant for FlexHub</div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Shop, compare products, check your orders or create seller listings from this single chat.
                      </p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {STARTERS[activeMode].map((prompt) => (
                        <button key={prompt} type="button" onClick={() => submit(prompt)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm leading-5 text-slate-300 hover:border-violet-500">
                          {prompt}
                        </button>
                      ))}
                    </div>
                    {!token && (
                      <p className="mt-4 rounded-xl bg-slate-900 p-3 text-xs leading-5 text-slate-400">
                        <Link to="/login" onClick={() => setOpen(false)} className="font-black text-violet-300">Sign in</Link> to unlock private order support.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((item, index) => (
                      <div key={`${item.role}-${index}`} className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${item.role === "user" ? "ml-auto bg-violet-600 text-white" : "bg-slate-900 text-slate-200"}`}>
                        {item.content}
                      </div>
                    ))}
                    {busy && (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-slate-300"><LoaderCircle className="animate-spin" size={17} /> FlexGuide is thinking…</div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800 p-3">
                {error && <p className="mb-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300" role="alert">{error}</p>}
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <label className="sr-only" htmlFor="unified-flexguide-message">Message FlexGuide</label>
                  <textarea
                    id="unified-flexguide-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submit();
                      }
                    }}
                    rows="1"
                    maxLength={activeMode === "seller" ? 1400 : 800}
                    disabled={busy}
                    className="max-h-28 min-h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500"
                    placeholder={MODE_DETAILS[activeMode].placeholder}
                  />
                  <button type="submit" disabled={busy || !message.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40" aria-label="Send message">
                    {busy ? <LoaderCircle className="animate-spin" size={19} /> : <Send size={19} />}
                  </button>
                </form>
                <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1"><CurrentModeIcon size={12} /> {MODE_DETAILS[activeMode].label} mode</span>
                  {messages.length > 0 && <button type="button" onClick={clearConversation} className="hover:text-slate-300">Clear chat</button>}
                </div>
              </div>
            </div>
          )}
        </aside>
      )}
    </>
  );
}
