import { useCallback, useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Edit, Trash2, X } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import PdfUploadField from "@/components/PdfUploadField";
import { TRIP_TYPES } from "@/lib/tripStyle";

const empty = {
  title: "", destination: "", country: "México", description: "", long_description: "",
  start_date: "", end_date: "", price: 0, currency: "MXN", pricing_tiers: [], extra_dates: [],
  included_transport: "", included_lodging: "", departure_points: "",
  group_min: 10, group_max: 15, spots_left: 15, cover_image: "",
  trip_type: "Clásico", region: "Nacional",
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
      const tiers = (data.pricing_tiers || [])
        .filter((t) => t.label && Number(t.price) > 0)
        .map((t) => ({ label: t.label, price: Number(t.price), icon: t.icon || "bed" }));
      const days = (data.start_date && data.end_date)
        ? Math.max(1, Math.round((new Date(data.end_date) - new Date(data.start_date)) / 86400000) + 1)
        : Number(data.duration_days) || 1;
      const basePrice = tiers.length > 0 ? Math.min(...tiers.map((t) => t.price)) : Number(data.price);
      const payload = {
        ...data,
        extra_dates: (data.extra_dates || []).filter((d) => d.start_date && d.end_date),
        pricing_tiers: tiers,
        duration_days: days,
        price: basePrice,
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
            {trips.length === 0 && <tr><td colSpan="6" className="text-center py-10 text-ink/50">No hay viajes</td></tr>}
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
          <DatesField
            dates={[{ start_date: f.start_date || "", end_date: f.end_date || "" }, ...(f.extra_dates || [])]}
            onChange={(list) => setF({
              ...f,
              start_date: list[0]?.start_date || "",
              end_date: list[0]?.end_date || "",
              extra_dates: list.slice(1),
            })}
          />
          <div className="grid sm:grid-cols-3 gap-4">
            {(f.pricing_tiers || []).length === 0 && (
              <Inp label="Precio base (desde)" type="number" v={f.price} onChange={(v) => set("price", v)} />
            )}
            <Inp label="Min grupo" type="number" v={f.group_min} onChange={(v) => set("group_min", v)} />
            <Inp label="Max grupo" type="number" v={f.group_max} onChange={(v) => set("group_max", v)} />
          </div>

          <PricingTiersField tiers={f.pricing_tiers || []} onChange={(v) => set("pricing_tiers", v)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">Tipo de viaje</label>
              <select data-testid="trip-type" value={f.trip_type || "Clásico"} onChange={(e) => set("trip_type", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone">
                {TRIP_TYPES.map((t) => <option key={t.key} value={t.key}>{t.key}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/60 mb-1 block">Destino</label>
              <select data-testid="trip-region" value={f.region || "Nacional"} onChange={(e) => set("region", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E0D8] bg-bone">
                <option value="Nacional">Nacional</option>
                <option value="Internacional">Internacional</option>
              </select>
            </div>
          </div>
          <Inp label="Lugares del viaje (separados por coma)" v={Array.isArray(f.places) ? f.places.join(", ") : (f.places || "")}
            onChange={(v) => set("places", v.split(",").map((s) => s.trim()).filter(Boolean))} textarea rows={2} />
          <Inp label="Lugares disponibles" type="number" v={f.spots_left} onChange={(v) => set("spots_left", v)} />
          <ImageUploadField label="Imagen principal" value={f.cover_image} onChange={(v) => set("cover_image", v)} testId="trip-cover" />
          <PdfUploadField label="Itinerario PDF" value={f.itinerary_pdf_url} onChange={(v) => set("itinerary_pdf_url", v)} testId="trip-pdf" />
          <Inp label="Imágenes adicionales (una URL por línea)" v={f.images} onChange={(v) => set("images", v)} textarea rows={3} />
          <Inp label="Incluye · Transporte (descripción)" v={f.included_transport} onChange={(v) => set("included_transport", v)} textarea rows={2} testId="trip-transport" />
          <Inp label="Incluye · Hospedaje (descripción)" v={f.included_lodging} onChange={(v) => set("included_lodging", v)} textarea rows={2} testId="trip-lodging" />
          <Inp label="Incluye · Puntos de salida CDMX (descripción)" v={f.departure_points} onChange={(v) => set("departure_points", v)} textarea rows={2} testId="trip-departure-points" />
          <Inp label="Incluye · otros (uno por línea)" v={f.included} onChange={(v) => set("included", v)} textarea rows={3} />
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

function DatesField({ dates, onChange }) {
  const update = (i, key, value) => onChange(dates.map((d, idx) => idx === i ? { ...d, [key]: value } : d));
  const add = () => onChange([...dates, { start_date: "", end_date: "" }]);
  const remove = (i) => onChange(dates.filter((_, idx) => idx !== i));

  return (
    <div data-testid="dates-field" className="border border-[#E5E0D8] rounded-xl p-4 bg-bone/40">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs uppercase tracking-wider text-ink/60">Fechas de salida</label>
        <button type="button" onClick={add} data-testid="add-trip-date"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta">
          <Plus size={14} /> Agregar fecha
        </button>
      </div>
      <div className="space-y-3">
        {dates.map((d, i) => (
          <div key={`date-${i}`} className="grid sm:grid-cols-[1fr_1fr_40px] gap-2 items-end">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Fecha inicio</label>
              <input data-testid={`date-start-${i}`} type="date" value={d.start_date || ""}
                required={i === 0}
                onChange={(e) => update(i, "start_date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Fecha fin</label>
              <input data-testid={`date-end-${i}`} type="date" value={d.end_date || ""}
                required={i === 0}
                onChange={(e) => update(i, "end_date", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm" />
            </div>
            {i > 0 ? (
              <button type="button" onClick={() => remove(i)} data-testid={`remove-date-${i}`}
                className="p-2 text-ink/50 hover:text-destructive"><Trash2 size={16} /></button>
            ) : <span />}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink/50 mt-3">La primera fecha es la salida principal (se usa para orden y filtros).</p>
    </div>
  );
}

function PricingTiersField({ tiers, onChange }) {
  const update = (i, key, value) => {
    const next = tiers.map((t, idx) => idx === i ? { ...t, [key]: value } : t);
    onChange(next);
  };
  const add = () => onChange([...tiers, { label: "", price: 0, icon: "bed" }]);
  const remove = (i) => onChange(tiers.filter((_, idx) => idx !== i));

  return (
    <div data-testid="pricing-tiers-field" className="border border-[#E5E0D8] rounded-xl p-4 bg-bone/40">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs uppercase tracking-wider text-ink/60">Costo por viajero (tipos de hospedaje)</label>
        <button type="button" onClick={add} data-testid="add-pricing-tier"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta">
          <Plus size={14} /> Agregar hospedaje
        </button>
      </div>
      {tiers.length === 0 && (
        <p className="text-xs text-ink/50">Sin tipos de hospedaje. Se mostrará el precio base como "Por persona".</p>
      )}
      <div className="space-y-3">
        {tiers.map((t, i) => (
          <div key={`tier-${i}`} className="grid sm:grid-cols-[1fr_140px_130px_40px] gap-2 items-end">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Tipo de hospedaje</label>
              <input data-testid={`tier-label-${i}`} value={t.label || ""}
                onChange={(e) => update(i, "label", e.target.value)}
                placeholder="Campamento / Cabaña / Hotel"
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Precio</label>
              <input data-testid={`tier-price-${i}`} type="number" value={t.price ?? 0}
                onChange={(e) => update(i, "price", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Ícono</label>
              <select data-testid={`tier-icon-${i}`} value={t.icon || "bed"}
                onChange={(e) => update(i, "icon", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm">
                <option value="bed">Hotel / Cabaña</option>
                <option value="tent">Campamento</option>
              </select>
            </div>
            <button type="button" onClick={() => remove(i)} data-testid={`remove-tier-${i}`}
              className="p-2 text-ink/50 hover:text-destructive"><Trash2 size={16} /></button>
          </div>
        ))}
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
