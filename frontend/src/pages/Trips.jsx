import { useEffect, useState } from "react";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";

const FILTERS = ["Todos", "México", "América", "Europa"];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState("Todos");

  useEffect(() => {
    api.get("/trips").then((r) => setTrips(r.data));
  }, []);

  const filtered = filter === "Todos" ? trips : trips.filter((t) => t.country === filter);

  return (
    <div data-testid="trips-page" className="pt-32 pb-24 bg-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-4">Catálogo</div>
        <h1 className="font-heading text-5xl sm:text-6xl text-ink mb-6">Próximos viajes</h1>
        <p className="text-ink/70 text-lg max-w-2xl mb-12">
          Explora nuestras próximas aventuras. Reserva tu lugar con anticipación: los grupos se llenan rápido.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f.toLowerCase()}`}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                filter === f
                  ? "bg-terracotta text-white border-terracotta"
                  : "bg-white text-ink border-[#E5E0D8] hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-ink/60 text-center py-20">No hay viajes en esta categoría por ahora.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}
