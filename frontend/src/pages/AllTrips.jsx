import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";
import FilterChip from "@/components/FilterChip";
import { TRIP_TYPES, REGIONS } from "@/lib/tripStyle";
import { SORTS } from "@/pages/Trips";

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function AllTrips() {
  const [trips, setTrips] = useState([]);
  const [type, setType] = useState("Todos");
  const [region, setRegion] = useState("Todas");
  const [month, setMonth] = useState(0); // 0 = todos
  const [sort, setSort] = useState("fecha");

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  // Counts respect the other active filters so chips reflect real results.
  const matches = (t, overrides = {}) => {
    const ty = overrides.type ?? type;
    const rg = overrides.region ?? region;
    const mo = overrides.month ?? month;
    if (ty !== "Todos" && t.trip_type !== ty) return false;
    if (rg !== "Todas" && (t.region || "Nacional") !== rg) return false;
    if (mo && (!t.start_date || new Date(t.start_date).getMonth() + 1 !== mo)) return false;
    return true;
  };

  const typeCounts = useMemo(() => {
    const map = { Todos: trips.filter((t) => matches(t, { type: "Todos" })).length };
    for (const ty of TRIP_TYPES) map[ty.key] = trips.filter((t) => matches(t, { type: ty.key })).length;
    return map;
  }, [trips, region, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const regionCounts = useMemo(() => {
    const map = { Todas: trips.filter((t) => matches(t, { region: "Todas" })).length };
    for (const r of REGIONS) map[r.key] = trips.filter((t) => matches(t, { region: r.key })).length;
    return map;
  }, [trips, type, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthCounts = useMemo(() => {
    const map = { 0: trips.filter((t) => matches(t, { month: 0 })).length };
    for (let m = 1; m <= 12; m++) map[m] = trips.filter((t) => matches(t, { month: m })).length;
    return map;
  }, [trips, type, region]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(
    () => trips.filter((t) => matches(t)).sort(SORTS[sort].fn),
    [trips, type, region, month, sort] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div data-testid="all-trips-page" className="bg-bone">
      <section className="pt-32 pb-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <Link to="/destinos" data-testid="back-to-destinos" className="inline-flex items-center gap-2 text-sm text-text-sec hover:text-green-700 mb-6">
            <ArrowLeft size={15} /> Volver a Destinos
          </Link>
          <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-4">Catálogo completo</div>
          <h1 className="font-display text-5xl sm:text-6xl text-text-main leading-[1.05] tracking-tight mb-5">
            Todos los viajes
          </h1>
          <p className="text-lg text-text-sec max-w-3xl">
            Filtra por mes, por destino nacional o internacional y por tipo de viaje.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 space-y-8">
          <FilterGroup title="Tipo de viaje">
            <FilterChip testid="ft-type-todos" label="Todos" count={typeCounts.Todos || 0}
              active={type === "Todos"} onClick={() => setType("Todos")} primary />
            {TRIP_TYPES.map((t) => (
              <FilterChip key={t.key}
                testid={`ft-type-${t.key.toLowerCase().replace(/[\s°]/g, "-")}`}
                label={t.key} count={typeCounts[t.key] || 0}
                active={type === t.key}
                onClick={() => setType(t.key)}
                onClear={() => setType("Todos")}
                icon={t.icon} iconClass={t.fg} />
            ))}
          </FilterGroup>

          <FilterGroup title="Destino">
            <FilterChip testid="ft-region-todas" label="Todas" count={regionCounts.Todas || 0}
              active={region === "Todas"} onClick={() => setRegion("Todas")} primary />
            {REGIONS.map((r) => (
              <FilterChip key={r.key} testid={`ft-region-${r.key.toLowerCase()}`}
                label={r.key} count={regionCounts[r.key] || 0}
                active={region === r.key}
                onClick={() => setRegion(r.key)}
                onClear={() => setRegion("Todas")}
                icon={r.icon} />
            ))}
          </FilterGroup>

          <FilterGroup title="Mes de salida">
            <FilterChip testid="ft-month-todos" label="Todos" count={monthCounts[0] || 0}
              active={month === 0} onClick={() => setMonth(0)} primary />
            {MONTH_NAMES.map((name, i) => (
              <FilterChip key={name} testid={`ft-month-${i + 1}`}
                label={name} count={monthCounts[i + 1] || 0}
                active={month === i + 1}
                onClick={() => setMonth(i + 1)}
                onClear={() => setMonth(0)} />
            ))}
          </FilterGroup>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
            <div data-testid="all-results-count" className="text-sm text-text-sec">
              Mostrando <span className="font-bold text-text-main">{filtered.length}</span> viaje{filtered.length === 1 ? "" : "s"}
            </div>
            <label className="flex items-center gap-3 text-sm text-text-sec">
              Ordenar por
              <select
                data-testid="all-sort-select"
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

          {filtered.length === 0 ? (
            <p data-testid="all-no-trips" className="text-text-sec text-center py-20">No hay viajes con estos filtros.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-text-sec font-bold mb-4">{title}</div>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
