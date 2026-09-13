import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { getTripTypeStyle, getRegionStyle } from "@/lib/tripStyle";
import { resolveImage } from "@/lib/api";

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

const fmtMoney = (n) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n || 0);

export default function TripCard({ trip }) {
  const style = getTripTypeStyle(trip.trip_type);
  const Icon = style.icon;
  const region = getRegionStyle(trip.region || "Nacional");
  const RegionIcon = region.icon;
  const soldOut = Number(trip.spots_left) <= 0;

  return (
    <article
      data-testid={`trip-card-${trip.id}`}
      data-soldout={soldOut ? "true" : "false"}
      className={`group bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        soldOut ? "opacity-60" : "hover:-translate-y-1 hover:shadow-floating hover:border-green-200"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EFEAE1]">
        <img
          src={resolveImage(trip.cover_image)}
          alt={trip.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            soldOut ? "grayscale-[35%]" : "group-hover:scale-105"
          }`}
        />
      </div>

      <div className="px-4 pt-3.5 pb-4 flex flex-col flex-1">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className={`inline-flex items-center gap-1 ${style.chip} text-[10px] font-semibold px-2 py-[3px] rounded-full`}>
            <Icon size={11} strokeWidth={2} /> {trip.trip_type || "Clásico"}
          </span>
          <span className={`inline-flex items-center gap-1 ${region.chip} text-[10px] font-semibold px-2 py-[3px] rounded-full`}>
            <RegionIcon size={11} strokeWidth={2} /> {region.key}
          </span>
        </div>

        <h3 className="font-display text-[21px] leading-tight text-text-main mb-1.5">{trip.title}</h3>
        <div className="flex items-center gap-1.5 text-[11px] text-text-sec mb-2.5">
          <Calendar size={11} className="text-orange-500" />
          <span>{fmtDateRange(trip.start_date, trip.end_date)}</span>
        </div>

        {trip.places?.length > 0 ? (
          <p className="text-[12px] text-text-sec leading-relaxed line-clamp-3 mb-4">
            <span className="font-bold text-text-main">Lugares:</span> {trip.places.slice(0, 8).join(", ")}
          </p>
        ) : (
          <p className="text-[12px] text-text-sec leading-relaxed line-clamp-3 mb-4">{trip.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] text-text-sec">desde</div>
            <div className="font-display text-[22px] text-text-main font-bold leading-none">
              ${fmtMoney(trip.price)} <span className="text-[10px] font-body font-medium text-text-sec">{trip.currency || "MXN"}</span>
            </div>
          </div>
          {soldOut ? (
            <span
              data-testid={`trip-card-cta-${trip.id}`}
              aria-disabled="true"
              className="inline-flex items-center justify-center bg-green-200 text-white px-4 py-2 rounded-lg text-[13px] font-semibold cursor-not-allowed select-none"
            >
              Sin cupo
            </span>
          ) : (
            <Link
              to={`/destinos/${trip.id}`}
              data-testid={`trip-card-cta-${trip.id}`}
              className="inline-flex items-center justify-center bg-green-700 hover:bg-green-600 active:bg-green-900 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-200"
            >
              Ver más
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
