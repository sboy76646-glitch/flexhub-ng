import { Bot, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function OrderSupportAssistant() {
  const { token } = useAuth();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function ask(event) {
    event.preventDefault();
    if (question.trim().length < 3) return;
    setBusy(true);
    try {
      const data = await apiRequest("/api/ai/order-support", {
        method: "POST",
        token,
        timeout: 60_000,
        body: JSON.stringify({ question }),
      });
      setResult(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-950 to-slate-950 p-6 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-violet-500/20 p-2 text-violet-200"><Bot size={22} /></span>
        <div><h2 className="text-xl font-black">Ask FlexSupport about your orders</h2><p className="mt-1 text-sm leading-6 text-slate-300">Answers are grounded only in your payment and tracking records. It cannot change an order or issue a refund.</p></div>
      </div>
      <form onSubmit={ask} className="mt-4 flex gap-2">
        <input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength="600" className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-slate-950 outline-none" placeholder="Where is my latest order?" />
        <button disabled={busy} className="rounded-xl bg-violet-500 px-4 text-white hover:bg-violet-400 disabled:opacity-50" aria-label="Ask FlexSupport"><Send size={19} /></button>
      </form>
      {result && (
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6">
          <p>{result.answer}</p>
          {result.recommendedAction && <p className="mt-3 text-violet-100"><strong>Next step:</strong> {result.recommendedAction}</p>}
          {result.matchedOrderReference && <p className="mt-2 text-xs text-slate-400">Matched order: {result.matchedOrderReference}</p>}
        </div>
      )}
    </section>
  );
}
