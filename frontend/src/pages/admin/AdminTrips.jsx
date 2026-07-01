import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import PdfUploadField from "@/components/PdfUploadField";

const empty = {
  title: "", destination: "", country: "México", description: "", long_description: "",
  duration_days: 1, start_date: "", end_date: "", price: 0, currency: "MXN",
  group_min: 10, group_max: 15, spots_left: 15, cover_image: "",
  images: [], itinerary: [], included: [], excluded: [], featured: false, active: true,
  itinerary_pdf_url: "",
};

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => api.get("/admin/trips").then((r) => setTrips(r.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    try {
      const payload = {
        ...data,
        duration_days: Number(data.duration_days),
        price: Number(data.price),
        group_min: Number(data.group_min),
        group_max: Number(data.group_max),
        spots_left: Number(data.spots_left),
        included: typeof data.included === "string" ? data.included.split("\n").filter(Boolean) : data.included,
        excluded: typeof data.excluded === "string" ? data.excluded.split("\n").filter(Boolean) : data.excluded,
        images: typeof data.images === "string" ? data.images.split("\n").filter(Boolean) : data.images,
      };
      if (data.id) await api.put(`/admin/trips/${data.id}`, payload);
      else await api.post("/admin/trips", payload);
      toast.success("Viaje guardado");
      setEditing(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const del = async (id) => {
    if (!window.confirm("¿Eliminar este viaje?")) return;
    await api.delete(`/admin/trips/${id}`);
    toast.success("Eliminado");
    load();
  };

  return (
    <div data-testid="admin-trips">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-3xl text-ink">Viajes</h2>
        <button data-testid="add-trip-btn" onClick={() => setEditing({ ...empty })}
          className="btn-terracotta inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm">
          <Plus size={16} /> Nuevo viaje
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink/70 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Título</th>
              <th className="px-5 py-3 font-medium">Destino</th>
              <th className="px-5 py-3 font-medium">Salida</th>
              <th className="px-5 py-3 font-medium">Días</th>
              <th className="px-5 py-3 font-medium">Precio</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-t border-[#E5E0D8]">
                <td className="px-5 py-3 font-medium text-ink">{t.title}</td>
                <td className="px-5 py-3 text-ink/70">{t.destination}</td>
                <td className="px-5 py-3 text-ink/70">{t.start_date}</td>
                <td className="px-5 py-3">{t.duration_days}</td>
                <td className="px-5 py-3">${t.price}</td>
                <td className="px-5 py-3">
                  {t.featured && <span className="text-xs px-2 py-0.5 rounded bg-terracotta/10 text-terracotta mr-1">Destacado</span>}
                  {t.active ? <span className="text-xs text-sage">Activo</span> : <span className="text-xs text-ink/50">Inactivo</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <button data-testid={`edit-trip-${t.id}`} onClick={() => setEditing({ ...t })} className="p-1.5 hover:text-terracotta"><Edit size={16} /></button>
                  <button data-testid={`del-trip-${t.id}`} onClick={() => del(t.id)} className="p-1.5 hover:text-destructive"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {trips.length === 0 && <tr><td colSpan="7" className="text-center py-10 text-ink/50">No hay viajes</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && <TripModal data={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function TripModal({ data, onClose, onSave }) {
  const [f, setF] = useState({
    ...data,
    images: Array.isArray(data.images) ? data.images.join("\n") : data.images,
    included: Array.isArray(data.included) ? data.included.join("\n") : data.included,
    excluded: Array.isArray(data.excluded) ? data.excluded.join("\n") : data.excluded,
  });
  const set = (k, v) => setF({ ...f, [k]: v });

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between">
          <h3 className="font-heading text-2xl">{f.id ? "Editar viaje" : "Nuevo viaje"}</h3>
          <button onClick={onClose} data-testid="close-modal"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="p-6 space-y-4">
          <Inp label="Título" v={f.title} onChange={(v) => set("title", v)} required testId="trip-title" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Inp label="Destino" v={f.destination} onChange={(v) => set("destination", v)} required />
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">País / Región</label>
              <select value={f.country} onChange={(e) => set("country", e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone">
                <option>México</option><option>América</option><option>Europa</option>
              </select>
            </div>
          </div>
          <Inp label="Descripción corta" v={f.description} onChange={(v) => set("description", v)} required textarea />
          <Inp label="Descripción larga" v={f.long_description} onChange={(v) => set("long_description", v)} textarea rows={4} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Inp label="Días" type="number" v={f.duration_days} onChange={(v) => set("duration_days", v)} />
            <Inp label="Fecha inicio" type="date" v={f.start_date} onChange={(v) => set("start_date", v)} />
            <Inp label="Fecha fin" type="date" v={f.end_date} onChange={(v) => set("end_date", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Inp label="Precio" type="number" v={f.price} onChange={(v) => set("price", v)} />
            <Inp label="Min grupo" type="number" v={f.group_min} onChange={(v) => set("group_min", v)} />
            <Inp label="Max grupo" type="number" v={f.group_max} onChange={(v) => set("group_max", v)} />
          </div>
          <Inp label="Lugares disponibles" type="number" v={f.spots_left} onChange={(v) => set("spots_left", v)} />
          <ImageUploadField label="Imagen principal" value={f.cover_image} onChange={(v) => set("cover_image", v)} testId="trip-cover" />
          <PdfUploadField label="Itinerario PDF" value={f.itinerary_pdf_url} onChange={(v) => set("itinerary_pdf_url", v)} testId="trip-pdf" />
          <Inp label="Imágenes adicionales (una URL por línea)" v={f.images} onChange={(v) => set("images", v)} textarea rows={3} />
          <Inp label="Incluye (una por línea)" v={f.included} onChange={(v) => set("included", v)} textarea rows={3} />
          <Inp label="No incluye (una por línea)" v={f.excluded} onChange={(v) => set("excluded", v)} textarea rows={2} />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Destacado</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} /> Activo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" data-testid="save-trip" className="btn-terracotta px-6 py-2.5 rounded-full font-semibold">Guardar</button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-full border border-[#E5E0D8]">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Inp({ label, v, onChange, type = "text", textarea = false, rows = 2, required, testId }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">{label}</label>
      {textarea ? (
        <textarea data-testid={testId} value={v || ""} required={required} rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
      ) : (
        <input data-testid={testId} type={type} value={v ?? ""} required={required}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
      )}
    </div>
  );
}
