import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function AdminFAQ() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => api.get("/faq").then((r) => setItems(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    try {
      const payload = { question: data.question, answer: data.answer, order: Number(data.order) || 0 };
      if (data.id) await api.put(`/admin/faq/${data.id}`, payload);
      else await api.post("/admin/faq", payload);
      toast.success("FAQ guardado");
      setEditing(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const del = async (id) => {
    if (!window.confirm("¿Eliminar este FAQ?")) return;
    await api.delete(`/admin/faq/${id}`);
    load();
  };

  return (
    <div data-testid="admin-faq">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-3xl text-ink">Preguntas frecuentes</h2>
        <button data-testid="add-faq" onClick={() => setEditing({ question: "", answer: "", order: items.length })}
          className="btn-terracotta inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm">
          <Plus size={16} /> Nueva pregunta
        </button>
      </div>

      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="bg-white border border-[#E5E0D8] rounded-2xl p-5 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-ink/50 mb-1">Orden #{f.order}</div>
              <div className="font-semibold text-ink">{f.question}</div>
              <div className="text-sm text-ink/70 mt-2 line-clamp-2">{f.answer}</div>
            </div>
            <div className="flex gap-1">
              <button data-testid={`edit-faq-${f.id}`} onClick={() => setEditing({ ...f })} className="p-2 hover:text-orange-600"><Edit size={16} /></button>
              <button data-testid={`del-faq-${f.id}`} onClick={() => del(f.id)} className="p-2 hover:text-destructive"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-ink/50 py-10">Sin FAQ aún</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl">
            <div className="border-b border-[#E5E0D8] px-6 py-4 flex justify-between items-center">
              <h3 className="font-heading text-2xl">{editing.id ? "Editar FAQ" : "Nueva pregunta"}</h3>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">Pregunta</label>
                <input data-testid="faq-question" required value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">Respuesta</label>
                <textarea data-testid="faq-answer" required rows={5} value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">Orden</label>
                <input data-testid="faq-order" type="number" value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: e.target.value })}
                  className="w-32 px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone" />
              </div>
              <div className="flex gap-3">
                <button type="submit" data-testid="save-faq" className="btn-terracotta px-6 py-2.5 rounded-full font-semibold">Guardar</button>
                <button type="button" onClick={() => setEditing(null)} className="px-6 py-2.5 rounded-full border border-[#E5E0D8]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
