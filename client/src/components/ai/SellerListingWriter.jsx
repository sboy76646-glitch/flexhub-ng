import { Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../lib/api";

export default function SellerListingWriter({ onApply }) {
  const { token } = useAuth();
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);

  async function generate() {
    if (notes.trim().length < 12) {
      toast.error("Add a few honest product details first.");
      return;
    }
    setBusy(true);
    try {
      const data = await apiRequest("/api/ai/seller/listing-draft", {
        method: "POST",
        token,
        timeout: 60_000,
        body: JSON.stringify({ notes }),
      });
      setDraft(data.draft);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 rounded-3xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-violet-600 p-2 text-white"><WandSparkles size={20} /></span>
        <div>
          <h3 className="font-black text-slate-950">FlexWrite AI listing builder</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Describe the real item in rough words. Gemini will improve the title and description without inventing specifications.</p>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows="3"
        maxLength="1400"
        className="mt-4 w-full rounded-xl border border-violet-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
        placeholder="Example: Samsung A35, brand new, 8GB RAM, 256GB, black, sealed box, one-year shop warranty..."
      />
      <button type="button" onClick={generate} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-bold text-white hover:bg-violet-700 disabled:opacity-50">
        <Sparkles size={17} /> {busy ? "Writing…" : "Generate honest listing"}
      </button>

      {draft && (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wider text-violet-700">Suggested draft</p>
          <h4 className="mt-2 text-lg font-black text-slate-950">{draft.title}</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{draft.description}</p>
          {draft.missingDetails?.length > 0 && (
            <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              <strong>Still confirm:</strong> {draft.missingDetails.join(" • ")}
            </div>
          )}
          <button type="button" onClick={() => onApply(draft)} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white hover:bg-orange-500">Use this draft in the form</button>
        </div>
      )}
    </section>
  );
}
