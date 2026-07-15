import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { PRODUCT_IMAGE_RULES, validateProductImage } from "../../services/cloudinary";

function ProductImagePicker({ file, onChange, disabled = false }) {
  const inputId = useId();
  const [error, setError] = useState("");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function selectFile(event) {
    const selected = event.target.files?.[0] || null;
    const validationError = validateProductImage(selected);

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      onChange(null);
      return;
    }

    setError("");
    onChange(selected);
  }

  function removeFile() {
    setError("");
    onChange(null);
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor={inputId}>
        Main product image
      </label>

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-300 bg-white">
          <img src={preview} alt="Selected product preview" className="h-72 w-full object-contain" />
          <button type="button" onClick={removeFile} disabled={disabled} className="absolute right-3 top-3 flex items-center gap-2 rounded-xl bg-slate-950/90 px-3 py-2 text-sm font-bold text-red-400 backdrop-blur hover:bg-red-500 hover:text-white disabled:cursor-not-allowed">
            <Trash2 size={17} /> Remove
          </button>
          <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      ) : (
        <label htmlFor={inputId} className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center transition ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-orange-500 hover:bg-orange-50"}`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400"><ImagePlus size={27} /></span>
          <span className="mt-5 font-bold text-slate-950">Choose a clear product photo</span>
          <span className="mt-2 text-sm leading-6 text-slate-500">JPG, PNG or WebP · maximum 5 MB</span>
          <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><UploadCloud size={17} /> Browse files</span>
        </label>
      )}

      <input id={inputId} type="file" accept={PRODUCT_IMAGE_RULES.accept} onChange={selectFile} disabled={disabled} className="sr-only" />
      {error && <p className="mt-2 text-sm font-semibold text-red-400" role="alert">{error}</p>}
    </div>
  );
}

export default ProductImagePicker;
