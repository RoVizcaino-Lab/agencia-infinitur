import { Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import ImageUploadField from "@/components/ImageUploadField";
import { resolveImage } from "@/lib/api";
import { hasCoords } from "@/lib/geo";
import StopLocationField from "@/components/StopLocationField";

const emptyDay = () => ({ title: "", description: "", note: "", stops: [] });
const emptyStop = () => ({ title: "", description: "", images: [], lat: null, lng: null });

// Closest stop of the same day that already has a location (previous ones first):
// the location map starts there instead of showing all of Mexico.
const nearestLocated = (stops, j) => {
  for (let d = 1; d < stops.length; d++) {
    if (hasCoords(stops[j - d])) return stops[j - d];
    if (hasCoords(stops[j + d])) return stops[j + d];
  }
  return null;
};

const move = (list, from, to) => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Admin editor for trip.itinerary_days.
 * `update` receives an updater fn (days => newDays) so late async uploads
 * never overwrite edits made in the meantime.
 */
export default function ItineraryDaysEditor({ days, update }) {
  const setDay = (i, fn) => update((ds) => ds.map((d, k) => (k === i ? fn(d) : d)));
  const setStops = (i, fn) => setDay(i, (d) => ({ ...d, stops: fn(d.stops || []) }));
  const setStop = (i, j, fn) => setStops(i, (ss) => ss.map((s, k) => (k === j ? fn(s) : s)));

  const removeDay = (i) => {
    if (!window.confirm(`¿Eliminar el Día ${i + 1} y todas sus paradas?`)) return;
    update((ds) => ds.filter((_, k) => k !== i));
  };
  const removeStop = (i, j) => {
    if (!window.confirm("¿Eliminar esta parada?")) return;
    setStops(i, (ss) => ss.filter((_, k) => k !== j));
  };

  return (
    <div data-testid="itinerary-days-editor" className="border border-[#E5E0D8] rounded-xl p-4 bg-bone/40">
      <label className="text-xs uppercase tracking-wider text-ink/60 block">Itinerario por días</label>
      <p className="text-[11px] text-ink/50 mt-1 mb-3">
        Cada día se muestra como una pestaña en la página del viaje. Los números de día y de parada se asignan solos según el orden.
      </p>

      <div className="space-y-4">
        {days.map((day, i) => (
          <div key={i} data-testid={`edit-day-${i}`} className="bg-white border border-[#E5E0D8] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg text-ink">Día {i + 1}</span>
              <button type="button" onClick={() => removeDay(i)} data-testid={`remove-day-${i}`}
                className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-destructive">
                <Trash2 size={14} /> Eliminar día
              </button>
            </div>
            <Field label="Título del día" placeholder="Camino a Oaxaca" value={day.title}
              onChange={(v) => setDay(i, (d) => ({ ...d, title: v }))} testId={`day-title-${i}`} />
            <Field label="Descripción general" value={day.description} textarea rows={3}
              onChange={(v) => setDay(i, (d) => ({ ...d, description: v }))} testId={`day-desc-${i}`} />

            <div className="space-y-3">
              {(day.stops || []).map((stop, j) => (
                <div key={j} data-testid={`edit-stop-${i}-${j}`} className="border border-[#E5E0D8] rounded-lg p-3 bg-bone/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="w-6 h-6 rounded-full bg-terracotta/10 text-terracotta text-xs flex items-center justify-center">{j + 1}</span>
                      Parada {j + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <IconBtn label="Subir parada" disabled={j === 0} testId={`stop-up-${i}-${j}`}
                        onClick={() => setStops(i, (ss) => move(ss, j, j - 1))}><ArrowUp size={14} /></IconBtn>
                      <IconBtn label="Bajar parada" disabled={j === day.stops.length - 1} testId={`stop-down-${i}-${j}`}
                        onClick={() => setStops(i, (ss) => move(ss, j, j + 1))}><ArrowDown size={14} /></IconBtn>
                      <IconBtn label="Eliminar parada" danger testId={`remove-stop-${i}-${j}`}
                        onClick={() => removeStop(i, j)}><Trash2 size={14} /></IconBtn>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Field label="Título" value={stop.title} testId={`stop-title-${i}-${j}`}
                      onChange={(v) => setStop(i, j, (s) => ({ ...s, title: v }))} />
                    <Field label="Descripción" value={stop.description} textarea rows={2} testId={`stop-desc-${i}-${j}`}
                      onChange={(v) => setStop(i, j, (s) => ({ ...s, description: v }))} />
                    <StopImagesField
                      images={stop.images || []}
                      update={(fn) => setStop(i, j, (s) => ({ ...s, images: fn(s.images || []) }))}
                      testId={`stop-img-${i}-${j}`}
                    />
                    <StopLocationField
                      value={{ lat: stop.lat, lng: stop.lng }}
                      hint={nearestLocated(day.stops, j)}
                      onChange={({ lat, lng }) => setStop(i, j, (s) => ({ ...s, lat, lng }))}
                      testId={`stop-loc-${i}-${j}`}
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setStops(i, (ss) => [...ss, emptyStop()])} data-testid={`add-stop-${i}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta">
                <Plus size={14} /> Agregar parada
              </button>
            </div>

            <Field label="Nota al pie (opcional)" placeholder="El itinerario puede cambiar por condiciones del clima."
              value={day.note} onChange={(v) => setDay(i, (d) => ({ ...d, note: v }))} testId={`day-note-${i}`} />
          </div>
        ))}
      </div>

      <button type="button" onClick={() => update((ds) => [...ds, emptyDay()])} data-testid="add-day"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta">
        <Plus size={14} /> Agregar día
      </button>
    </div>
  );
}

function StopImagesField({ images, update, testId }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">Fotos</label>
      <div className="flex flex-wrap gap-3 items-center">
        {images.map((url, k) => (
          <div key={`${k}-${url}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E5E0D8] bg-bone">
            <img src={resolveImage(url)} alt="" className="w-full h-full object-cover" />
            <button type="button" aria-label="Quitar foto" data-testid={`${testId}-${k}-clear`}
              onClick={() => update((imgs) => imgs.filter((_, n) => n !== k))}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 hover:bg-white text-ink flex items-center justify-center">
              <X size={12} />
            </button>
          </div>
        ))}
        {/* Empty upload field = "add a photo": each upload appends to the list */}
        <ImageUploadField key={`new-${images.length}`} label="" allowUrl={false} value="" testId={`${testId}-new`}
          onChange={(v) => v && update((imgs) => [...imgs, v])} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea = false, rows = 2, placeholder, testId }) {
  const cls = "w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-white text-sm focus:outline-none focus:border-terracotta";
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-ink/50 mb-1 block">{label}</label>
      {textarea ? (
        <textarea data-testid={testId} value={value || ""} rows={rows} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} className={cls} />
      ) : (
        <input data-testid={testId} value={value || ""} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

function IconBtn({ children, onClick, label, disabled, danger, testId }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} data-testid={testId}
      className={`p-1.5 rounded-md text-ink/50 hover:bg-white disabled:opacity-30 disabled:pointer-events-none ${danger ? "hover:text-destructive" : "hover:text-ink"}`}>
      {children}
    </button>
  );
}
