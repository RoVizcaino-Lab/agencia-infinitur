import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({ url: "", caption: "", location: "" });
  const load = useCallback(() => api.get("/gallery").then((r) => setPhotos(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    if (!form.url) { toast.error("Sube o pega una URL de imagen"); return; }
    try {
      await api.post("/admin/gallery", form);
      toast.success("Foto agregada");
      setForm({ url: "", caption: "", location: "" });
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };
  const del = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    await api.delete(`/admin/gallery/${id}`);
    load();
  };

  return (
    <div data-testid="admin-gallery">
      <h2 className="font-heading text-3xl text-ink mb-6">Galería</h2>
      <form onSubmit={add} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 mb-8 space-y-4">
        <ImageUploadField label="Foto" value={form.url} onChange={(v) => setForm({ ...form, url: v })} testId="gallery-img" />
        <div className="grid sm:grid-cols-2 gap-3">
          <input data-testid="gallery-caption" placeholder="Descripción" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
          <input data-testid="gallery-location" placeholder="Ubicación" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
        </div>
        <button data-testid="add-photo" className="btn-terracotta px-5 py-2.5 rounded-full font-semibold inline-flex items-center gap-2">
          <Plus size={16} /> Agregar a galería
        </button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((p) => (
          <div key={p.id} className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-semibold text-ink">{p.caption || "—"}</div>
                <div className="text-ink/50">{p.location}</div>
              </div>
              <button data-testid={`del-photo-${p.id}`} onClick={() => del(p.id)} className="p-1.5 text-ink/50 hover:text-destructive"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
