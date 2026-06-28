import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";
import MonthCarousel from "@/components/MonthCarousel";
import { TRIP_TYPES, getTripTypeStyle } from "@/lib/tripStyle";
import { waLink, WA_MESSAGES, WA_DISPLAY } from "@/lib/whatsapp";

const MONTH_NAMES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [params, setParams] = useSearchParams();
  const mes = params.get("mes");

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  // Counts per trip type for chip badges
  const counts = useMemo(() => {
    const map = { Todos: trips.length };
    for (const t of TRIP_TYPES) map[t.key] = 0;
    for (const trip of trips) {
      if (map[trip.trip_type] !== undefined) map[trip.trip_type] += 1;
    }
    return map;
  }, [trips]);

  let filtered = typeFilter === "Todos" ? trips : trips.filter((t) => t.trip_type === typeFilter);
  if (mes) {
    const m = parseInt(mes, 10);
    filtered = filtered.filter((t) => {
      if (!t.start_date) return false;
      const d = new Date(t.start_date);
      return d.getMonth() + 1 === m;
    });
  }

  return (
    <div data-testid="trips-page" className="bg-bone">
      {/* HERO */}
      <section className="pt-32 pb-12 sm:pb-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-4">Catálogo</div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text-main leading-[1.05] tracking-tight mb-5">
            Elige tu próximo viaje
          </h1>
          <p className="text-lg sm:text-xl text-text-sec max-w-3xl">
            Salidas desde CDMX · Grupos de 10 a 15 personas · Nacionales e Internacionales
          </p>
        </div>
      </section>

      {/* FILTER CHIPS */}
      <section className="pb-8">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="text-[10px] uppercase tracking-[0.25em] text-text-sec font-bold mb-4">Tipo de viaje</div>
          <div className="flex flex-wrap gap-3">
            <FilterChip
              testid="filter-todos"
              label="Todos"
              count={counts.Todos || 0}
              active={typeFilter === "Todos"}
              onClick={() => setTypeFilter("Todos")}
              primary
            />
            {TRIP_TYPES.map((t) => (
              <FilterChip
                key={t.key}
                testid={`filter-${t.key.toLowerCase()}`}
                label={t.key}
                count={counts[t.key] || 0}
                active={typeFilter === t.key}
                onClick={() => setTypeFilter(t.key)}
                style={t}
              />
            ))}
          </div>

          {mes && (
            <div data-testid="month-filter-active" className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mt-5">
              Filtrando: {MONTH_NAMES[parseInt(mes, 10)] || mes}
              <button onClick={() => setParams({})} className="hover:bg-white/20 rounded-full px-2" aria-label="Quitar filtro">✕</button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="pb-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="flex items-end justify-between mb-8">
            <div className="text-sm text-text-sec">
              Mostrando <span className="font-bold text-text-main">{filtered.length}</span> destino{filtered.length === 1 ? "" : "s"} – <span className="text-orange-500 font-semibold">Explora</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p data-testid="no-trips" className="text-text-sec text-center py-20">No hay viajes para esta selección.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* CALENDARIO */}
      <MonthCarousel />

      {/* NO ENCUENTRAS LO QUE BUSCAS */}
      <section className="py-20 bg-[#F0F7EA]">
        <div className="max-w-5xl mx-auto px-5 lg:px-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 shadow-soft">
            <Sparkles size={14} /> A la carta
          </div>
          <h2 className="font-display text-4xl sm:text-5xl text-text-main leading-tight mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-lg text-text-sec max-w-2xl mx-auto mb-8">
            Armamos tu viaje a la carta. Cuéntanos a dónde quieres ir, con quién y cuándo — y te proponemos un itinerario.
          </p>
          <a
            href={waLink(WA_MESSAGES.aLaCarta)}
            target="_blank"
            rel="noreferrer"
            data-testid="a-la-carta-cta"
            className="btn-whatsapp inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold"
          >
            <MessageCircle size={18} fill="white" /> Escríbenos al {WA_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}

function FilterChip({ testid, label, count, active, onClick, primary = false, style }) {
  // Active styles vary depending on chip
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all";
  if (primary) {
    return (
      <button
        data-testid={testid}
        onClick={onClick}
        className={`${base} ${active
          ? "bg-green-700 text-white border-green-700"
          : "bg-white text-text-main border-[#E8E6E0] hover:border-green-700 hover:text-green-700"}`}
      >
        <span>{label}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? "bg-white/25" : "bg-[#F5F2EC]"}`}>{count}</span>
      </button>
    );
  }
  const Icon = style?.icon;
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`${base} ${active
        ? "bg-green-700 text-white border-green-700"
        : "bg-white text-text-main border-[#E8E6E0] hover:border-green-700"}`}
    >
      {Icon && <Icon size={14} className={active ? "text-white" : style?.fg} />}
      <span>{label}</span>
      <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? "bg-white/25" : "bg-[#F5F2EC]"}`}>{count}</span>
    </button>
  );
}

// Linter-friendly: still expose link import even if not used directly
export { Link };
