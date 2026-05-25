import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Plus, Star } from "lucide-react";

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ author: "", location: "", text: "", rating: 5 });
  const load = useCallback(() => api.get("/testimonials").then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/testimonials", { ...form, rating: Number(form.rating) });
      toast.success("Testimonio agregado");
      setForm({ author: "", location: "", text: "", rating: 5 });
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };
  const del = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    load();
  };

  return (
    <div data-testid="admin-testimonials">
      <h2 className="font-heading text-3xl text-ink mb-6">Testimonios</h2>
      <form onSubmit={add} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 mb-8 grid sm:grid-cols-4 gap-3 items-end">
        <input data-testid="t-author" required placeholder="Autor" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
        <input data-testid="t-location" placeholder="Ciudad" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
        <input data-testid="t-rating" type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
        <textarea data-testid="t-text" required placeholder="Testimonio" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
          className="px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone sm:col-span-4" rows={3} />
        <button data-testid="add-testimonial" className="btn-terracotta px-5 py-2.5 rounded-full font-semibold inline-flex items-center gap-2 w-fit">
          <Plus size={16} /> Agregar
        </button>
      </form>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-white border border-[#E5E0D8] rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-0.5 text-terracotta">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key -- presentational stars
                  <Star key={`star-${t.id}-${i}`} size={14} fill="currentColor" />
                ))}
              </div>
              <button data-testid={`del-testimonial-${t.id}`} onClick={() => del(t.id)} className="p-1 text-ink/50 hover:text-destructive"><Trash2 size={14} /></button>
            </div>
            <p className="text-ink/80 italic text-sm mb-3">"{t.text}"</p>
            <div className="text-sm font-semibold text-ink">{t.author} <span className="text-ink/50 font-normal">· {t.location}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
