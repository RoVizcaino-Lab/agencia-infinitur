import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default function AdminVideos() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ fb_url: "", title: "", order: 0 });

  const load = useCallback(() => api.get("/videos").then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const url = form.fb_url.trim();
    if (!url.includes("facebook.com")) {
      toast.error("Pega una URL de video de Facebook (debe contener 'facebook.com').");
      return;
    }
    try {
      await api.post("/admin/videos", { ...form, fb_url: url, order: Number(form.order) || 0 });
      toast.success("Video agregado");
      setForm({ fb_url: "", title: "", order: 0 });
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const del = async (id) => {
    if (!window.confirm("¿Eliminar este video?")) return;
    await api.delete(`/admin/videos/${id}`);
    load();
  };

  return (
    <div data-testid="admin-videos">
      <h2 className="font-heading text-3xl text-ink mb-2">Videos de Facebook</h2>
      <p className="text-ink/60 mb-6 text-sm max-w-2xl">
        Pega aquí URLs de videos de tu página de Facebook. Se reproducirán <strong>dentro del sitio</strong> en la sección &ldquo;Vive cada viaje en tiempo real&rdquo; de la página de inicio.
        Para obtener la URL: en Facebook, abre el video → menú &ldquo;···&rdquo; → &ldquo;Copiar enlace&rdquo;.
      </p>

      <form onSubmit={add} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 mb-8 space-y-3">
        <input data-testid="video-url" required placeholder="https://www.facebook.com/marinerus.infinitur/videos/12345..." value={form.fb_url}
          onChange={(e) => setForm({ ...form, fb_url: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-orange-400 text-sm" />
        <div className="grid sm:grid-cols-3 gap-3">
          <input data-testid="video-title" placeholder="Título (opcional)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone sm:col-span-2" />
          <input data-testid="video-order" type="number" placeholder="Orden" value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
        </div>
        <button data-testid="add-video" className="btn-terracotta px-5 py-2.5 rounded-full font-semibold inline-flex items-center gap-2">
          <Plus size={16} /> Agregar video
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-center text-ink/50 py-10">Aún no has agregado ningún video.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((v) => (
            <div key={v.id} className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  title={v.title || "preview"}
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.fb_url)}&show_text=false&width=560`}
                  className="w-full h-full"
                  style={{ border: "none" }}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-ink text-sm truncate">{v.title || "Sin título"}</div>
                  <a href={v.fb_url} target="_blank" rel="noreferrer" className="text-xs text-orange-600 inline-flex items-center gap-1 hover:underline">
                    Ver en Facebook <ExternalLink size={11} />
                  </a>
                </div>
                <button data-testid={`del-video-${v.id}`} onClick={() => del(v.id)} className="p-1.5 text-ink/50 hover:text-destructive flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
