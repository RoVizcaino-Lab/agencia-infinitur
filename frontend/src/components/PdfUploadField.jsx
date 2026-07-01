import { useRef, useState } from "react";
import { Upload, Loader2, X, FileText, ExternalLink } from "lucide-react";
import api, { formatApiError, BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";

/**
 * PDF upload field for admin forms.
 * Reuses the /api/admin/upload endpoint (accepts pdf).
 */
export default function PdfUploadField({ value, onChange, label = "PDF", testId = "pdf-upload" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const fullUrl = value && value.startsWith("/") ? `${BACKEND_URL}${value}` : value;

  const handle = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("El archivo debe ser un PDF");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(data.url);
      toast.success("PDF subido");
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
          <div className="flex items-center gap-2 bg-bone border border-[#E5E0D8] rounded-xl px-3 py-2 flex-shrink-0">
            <FileText size={16} className="text-orange-500" />
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              data-testid={`${testId}-link`}
              className="text-sm font-semibold text-ink hover:text-orange-600 inline-flex items-center gap-1 max-w-[200px] truncate"
            >
              Ver PDF <ExternalLink size={11} />
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-5 h-5 rounded-full bg-white hover:bg-[#FFE0C8] text-ink flex items-center justify-center"
              aria-label="Quitar"
              data-testid={`${testId}-clear`}
            >
              <X size={11} />
            </button>
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Pega una URL o sube un PDF"
            data-testid={`${testId}-url`}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-orange-400 text-sm"
          />
          <input
            ref={ref}
            type="file"
            accept="application/pdf,.pdf"
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
            {busy ? "Subiendo…" : "Subir PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
