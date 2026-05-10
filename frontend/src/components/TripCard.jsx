import { Link } from "react-router-dom";
import { Calendar, Users, MapPin } from "lucide-react";

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  } catch { return iso; }
};

const fmtMoney = (n, c = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function TripCard({ trip, tall = false }) {
  return (
    <Link
      to={`/viajes/${trip.id}`}
      data-testid={`trip-card-${trip.id}`}
      className="group bg-white border border-[#E5E0D8] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-floating block"
    >
      <div className={`relative overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
        <img
          src={trip.cover_image}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-ink">
          {trip.country}
        </div>
        {trip.featured && (
          <div className="absolute top-4 right-4 bg-terracotta text-white px-3 py-1 rounded-full text-xs font-semibold">
            Destacado
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-ink/60 mb-2">
          <MapPin size={12} />
          <span>{trip.destination}</span>
        </div>
        <h3 className="font-heading text-2xl leading-tight text-ink mb-3">{trip.title}</h3>
        <p className="text-sm text-ink/70 line-clamp-2 mb-5">{trip.description}</p>

        <div className="flex items-center justify-between text-xs text-ink/60 border-t border-[#E5E0D8] pt-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>{fmtDate(trip.start_date)} · {trip.duration_days}d</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            <span>{trip.spots_left}/{trip.group_max} lugares</span>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink/50">Desde</div>
            <div className="font-heading text-2xl text-terracotta">{fmtMoney(trip.price, trip.currency)}</div>
          </div>
          <span className="text-sm font-semibold text-terracotta group-hover:underline">Ver detalles →</span>
        </div>
      </div>
    </Link>
  );
}
