import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { getTripTypeStyle } from "@/lib/tripStyle";

const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const fmtDateRange = (startIso, endIso) => {
  try {
    const s = new Date(startIso);
    const e = endIso ? new Date(endIso) : s;
    const sDay = s.getDate();
    const eDay = e.getDate();
    const sMonth = MONTHS_ES[s.getMonth()];
    const eMonth = MONTHS_ES[e.getMonth()];
    const yr = e.getFullYear();
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${sDay} al ${eDay} de ${sMonth}, ${yr}`;
    }
    return `${sDay} ${sMonth} al ${eDay} ${eMonth}, ${yr}`;
  } catch { return startIso; }
};

const fmtMoney = (n, c = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function TripCard({ trip }) {
  const style = getTripTypeStyle(trip.trip_type);
  const Icon = style.icon;
  const region = trip.region || "Nacional";

  return (
    <article
      data-testid={`trip-card-${trip.id}`}
      className="group bg-white border border-[#E8E6E0] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-floating flex flex-col"
    >
      {/* Illustrated header (no photo, per Figma) */}
      <div className={`relative ${style.bg} h-44 flex items-center justify-center overflow-hidden`}>
        <Icon className={`${style.fg} opacity-70`} size={72} strokeWidth={1.4} />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 ${style.chip} text-[11px] font-semibold px-3 py-1 rounded-full`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {trip.trip_type || "Clásico"}
          </span>
          <span className="inline-flex items-center gap-1 bg-white/85 backdrop-blur text-text-main text-[11px] font-semibold px-3 py-1 rounded-full">
            {region}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-2xl leading-tight text-text-main mb-2">{trip.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-text-sec mb-4">
          <Calendar size={12} className="text-orange-500" />
          <span>{fmtDateRange(trip.start_date, trip.end_date)}</span>
        </div>

        {trip.places?.length > 0 ? (
          <p className="text-sm text-text-sec line-clamp-2 mb-5">
            <span className="font-semibold text-text-main">Lugares:</span> {trip.places.slice(0, 6).join(", ")}
          </p>
        ) : (
          <p className="text-sm text-text-sec line-clamp-2 mb-5">{trip.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4 border-t border-[#E8E6E0]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-sec">desde</div>
            <div className="font-display text-2xl text-orange-500 font-bold">{fmtMoney(trip.price, trip.currency)}</div>
          </div>
          <Link
            to={`/destinos/${trip.id}`}
            data-testid={`trip-card-cta-${trip.id}`}
            className="btn-orange inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
          >
            Ver más <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
