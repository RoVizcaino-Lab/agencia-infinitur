import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";
import FilterChip from "@/components/FilterChip";
import MonthCarousel from "@/components/MonthCarousel";
import { TRIP_TYPES } from "@/lib/tripStyle";
import { waLink, WA_MESSAGES, WA_DISPLAY } from "@/lib/whatsapp";

const MONTH_NAMES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const MAX_CARDS = 8;

export const SORTS = {
  fecha: { label: "Fecha más próxima", fn: (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0) },
  precio_asc: { label: "Precio: menor a mayor", fn: (a, b) => (a.price || 0) - (b.price || 0) },
  precio_desc: { label: "Precio: mayor a menor", fn: (a, b) => (b.price || 0) - (a.price || 0) },
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [sort, setSort] = useState("fecha");
  const [params, setParams] = useSearchParams();
  const mes = params.get("mes");

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  const counts = useMemo(() => {
    const map = { Todos: trips.length };
    for (const t of TRIP_TYPES) map[t.key] = 0;
    for (const trip of trips) {
      if (map[trip.trip_type] !== undefined) map[trip.trip_type] += 1;
    }
    return map;
  }, [trips]);

  const filtered = useMemo(() => {
    let list = typeFilter === "Todos" ? [...trips] : trips.filter((t) => t.trip_type === typeFilter);
    if (mes) {
      const m = parseInt(mes, 10);
      list = list.filter((t) => t.start_date && new Date(t.start_date).getMonth() + 1 === m);
    }
    return list.sort(SORTS[sort].fn);
  }, [trips, typeFilter, mes, sort]);

  const visible = filtered.slice(0, MAX_CARDS);

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
            Salidas desde CDMX · Grupos de 10 a 15 personas · Nacionales e internacionales
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
                testid={`filter-${t.key.toLowerCase().replace(/[\s°]/g, "-")}`}
                label={t.key}
                count={counts[t.key] || 0}
                active={typeFilter === t.key}
                onClick={() => setTypeFilter(t.key)}
                onClear={() => setTypeFilter("Todos")}
                icon={t.icon}
                iconClass={t.fg}
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
      <section className="pb-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <div data-testid="results-count" className="text-sm text-text-sec">
              Mostrando <span className="font-bold text-text-main">{visible.length}</span> destino{visible.length === 1 ? "" : "s"} – <span className="text-orange-500 font-semibold">{typeFilter}</span>
            </div>
            <label className="flex items-center gap-3 text-sm text-text-sec">
              Ordenar por
              <select
                data-testid="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-carbon text-white font-semibold px-4 py-2.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
              >
                {Object.entries(SORTS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <p data-testid="no-trips" className="text-text-sec text-center py-20">No hay viajes para esta selección.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visible.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/todos-los-viajes"
              data-testid="see-all-trips-cta"
              className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-7 py-3 rounded-xl font-semibold text-sm transition-colors duration-200"
            >
              Seguir viendo más viajes <ArrowRight size={16} />
            </Link>
          </div>
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
