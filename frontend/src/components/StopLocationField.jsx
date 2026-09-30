import { lazy, Suspense, useState } from "react";
import { MapPin, Search, Loader2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { hasCoords, parseCoords, formatCoords, round6 } from "@/lib/geo";

const LocationPickerMap = lazy(() => import("@/components/LocationPickerMap"));

// OpenStreetMap's free geocoder. Its usage policy allows light use without a key:
// search only on explicit submit (never while typing).
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/**
 * Location of an itinerary stop: search a place, click the map, or paste coordinates.
 * Collapsed by default so a form with many stops doesn't load many maps.
 */
export default function StopLocationField({ value, hint, onChange, testId }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [pasted, setPasted] = useState("");
  const has = hasCoords(value);

  const pick = (p) => { onChange(p); setResults(null); };

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const url = `${NOMINATIM}?format=jsonv2&limit=5&accept-language=es&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      setResults(data.map((d) => ({ name: d.display_name, lat: round6(Number(d.lat)), lng: round6(Number(d.lon)) })));
      if (data.length === 1) pick({ lat: round6(Number(data[0].lat)), lng: round6(Number(data[0].lon)) });
    } catch {
      toast.error("No se pudo buscar el lugar. Intenta de nuevo o pega las coordenadas.");
    } finally {
      setSearching(false);
    }
  };

  const applyPasted = () => {
    const p = parseCoords(pasted);
    if (!p) { toast.error('Formato no válido. Ejemplo: 17.0654, -96.7236'); return; }
    pick(p);
    setPasted("");
  };

  // Enter inside these inputs must not submit the whole trip form
  const onEnter = (fn) => (e) => { if (e.key === "Enter") { e.preventDefault(); fn(); } };

  return (
    <div className="border border-[#E5E0D8] rounded-lg bg-white" data-testid={testId}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={() => setOpen((o) => !o)} data-testid={`${testId}-toggle`}
          className="flex-1 min-w-0 flex items-center gap-2 text-left text-sm">
          <MapPin size={15} className={has ? "text-green-700" : "text-ink/40"} />
          <span className="text-[10px] uppercase tracking-wider text-ink/50">Ubicación</span>
          <span className={`truncate ${has ? "text-ink" : "text-ink/40"}`} data-testid={`${testId}-value`}>
            {has ? formatCoords(value) : "sin definir"}
          </span>
          <ChevronDown size={14} className={`ml-auto text-ink/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {has && (
          <button type="button" onClick={() => onChange({ lat: null, lng: null })} data-testid={`${testId}-clear`}
            className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-destructive whitespace-nowrap">
            <X size={13} /> Quitar ubicación
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#E5E0D8] pt-3">
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onEnter(search)}
              placeholder="Buscar lugar, ej. Hierve el Agua, Oaxaca" data-testid={`${testId}-search`}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E5E0D8] bg-bone/40 text-sm focus:outline-none focus:border-terracotta" />
            <button type="button" onClick={search} disabled={searching} data-testid={`${testId}-search-btn`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-terracotta/10 text-terracotta text-sm font-semibold disabled:opacity-50">
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Buscar
            </button>
          </div>

          {results && (
            <ul className="border border-[#E5E0D8] rounded-lg divide-y divide-[#E5E0D8] text-sm max-h-44 overflow-y-auto" data-testid={`${testId}-results`}>
              {results.length === 0 && <li className="px-3 py-2 text-ink/50">Sin resultados. Prueba con otro nombre o haz clic en el mapa.</li>}
              {results.map((r, k) => (
                <li key={k}>
                  <button type="button" onClick={() => pick({ lat: r.lat, lng: r.lng })} data-testid={`${testId}-result-${k}`}
                    className="w-full text-left px-3 py-2 hover:bg-bone/60 text-ink/80">{r.name}</button>
                </li>
              ))}
            </ul>
          )}

          <Suspense fallback={<div className="h-[240px] rounded-lg bg-[#EFEAE1]" />}>
            <LocationPickerMap value={value} hint={hint} onPick={pick} />
          </Suspense>
          <p className="text-[11px] text-ink/50">Haz clic en el mapa para colocar el punto. Puedes arrastrarlo para ajustarlo.</p>

          <div className="flex gap-2">
            <input value={pasted} onChange={(e) => setPasted(e.target.value)} onKeyDown={onEnter(applyPasted)}
              placeholder="O pega coordenadas: 17.0654, -96.7236" data-testid={`${testId}-paste`}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#E5E0D8] bg-bone/40 text-sm focus:outline-none focus:border-terracotta" />
            <button type="button" onClick={applyPasted} data-testid={`${testId}-paste-btn`}
              className="px-3 py-2 rounded-lg border border-[#E5E0D8] text-sm font-semibold text-ink/70 hover:bg-bone/60">
              Usar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
