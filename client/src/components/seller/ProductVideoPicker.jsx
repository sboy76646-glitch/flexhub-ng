import { Film, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { PRODUCT_VIDEO_RULES, validateProductVideo } from "../../services/cloudinary";

function ProductVideoPicker({ file, onChange, disabled = false }) {
  const inputId = useId();
  const [error, setError] = useState("");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;
    const validationError = validateProductVideo(selected);
    if (validationError) {
      setError(validationError);
      event.target.value = "";
      onChange(null);
      return;
    }

    setError("");
    onChange(selected);
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={inputId}>
        FlexProof product video <span className="font-normal text-slate-400">(optional)</span>
      </label>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-slate-950">
          <video src={preview} controls className="max-h-80 w-full" />
          <button type="button" onClick={() => onChange(null)} disabled={disabled} className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-2 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white">
            <Trash2 size={16} /> Remove
          </button>
        </div>
      ) : (
        <label htmlFor={inputId} className={`flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-orange-500 hover:bg-orange-50"}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Film size={24} /></span>
          <span className="mt-4 font-bold text-slate-950">Show buyers the actual product</span>
          <span className="mt-2 max-w-lg text-sm leading-6 text-slate-500">Record condition, colour, model, included accessories and any visible defects. MP4, WebM or MOV · maximum 50 MB.</span>
          <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><UploadCloud size={17} />Choose video</span>
        </label>
      )}

      <input id={inputId} type="file" accept={PRODUCT_VIDEO_RULES.accept} onChange={selectFile} disabled={disabled} className="sr-only" />
      {error && <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{error}</p>}
    </div>
  );
}

export default ProductVideoPicker;
