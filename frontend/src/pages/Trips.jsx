import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";

const FILTERS = ["Todos", "México", "América", "Europa"];
const MONTH_NAMES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState("Todos");
  const [params, setParams] = useSearchParams();
  const mes = params.get("mes");

  useEffect(() => {
    api.get("/trips").then((r) => setTrips(r.data));
  }, []);

  let filtered = filter === "Todos" ? trips : trips.filter((t) => t.country === filter);
  if (mes) {
    const m = parseInt(mes, 10);
    filtered = filtered.filter((t) => {
      if (!t.start_date) return false;
      const d = new Date(t.start_date);
      return d.getMonth() + 1 === m;
    });
  }

  return (
    <div data-testid="trips-page" className="pt-32 pb-24 bg-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-xs uppercase tracking-[0.25em] text-orange-600 mb-4">Catálogo</div>
        <h1 className="font-heading text-5xl sm:text-6xl text-ink mb-6">Próximos viajes</h1>
        <p className="text-ink/70 text-lg max-w-2xl mb-8">
          Explora nuestras próximas aventuras. Reserva tu lugar con anticipación: los grupos se llenan rápido.
        </p>

        {mes && (
          <div data-testid="month-filter-active" className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Filtrando: {MONTH_NAMES[parseInt(mes, 10)] || mes}
            <button onClick={() => setParams({})} className="hover:bg-white/20 rounded-full px-2" aria-label="Quitar filtro">✕</button>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                filter === f
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-ink border-[#E5E0D8] hover:border-orange-500 hover:text-orange-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink/60 text-center py-20">No hay viajes para esta selección.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
