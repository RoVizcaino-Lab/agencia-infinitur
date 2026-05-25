import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import api, { formatApiError, BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";

/**
 * Image upload field for admin forms.
 * Props:
 *  - value: current image URL (may be absolute or relative /api/files/:id)
 *  - onChange: (url) => void
 *  - label: optional label
 *  - testId: optional data-testid prefix
 */
export default function ImageUploadField({ value, onChange, label = "Imagen", testId = "img-upload" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const fullUrl = value && value.startsWith("/") ? `${BACKEND_URL}${value}` : value;

  const handle = async (file) => {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("Imagen subida");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">{label}</label>
      <div className="flex items-start gap-3 flex-wrap">
        {fullUrl && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E5E0D8] bg-bone flex-shrink-0">
            <img src={fullUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center"
              aria-label="Quitar"
              data-testid={`${testId}-clear`}
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Pega una URL o sube un archivo"
            data-testid={`${testId}-url`}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-orange-400 text-sm"
          />
          <input
            ref={ref}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handle(e.target.files?.[0])}
            data-testid={`${testId}-file`}
          />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            data-testid={`${testId}-btn`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {busy ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      </div>
    </div>
  );
}
