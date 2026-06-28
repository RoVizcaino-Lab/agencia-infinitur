import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import api, { resolveImage } from "@/lib/api";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const fmtMoney = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export default function MonthCarousel({ year, expanded = true, eyebrow = "CALENDARIO DE AVENTURAS", title = "¿Cuándo te vas de viaje?", subtitle = "Estos son los meses con viajes confirmados. Elige el que más te emocione." }) {
  const [trips, setTrips] = useState([]);
  const [active, setActive] = useState(null);
  const [currentYear, setCurrentYear] = useState(year || new Date().getFullYear());
  const railRef = useRef(null);

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  // Map: monthIndex (0-11) → list of trips that start in that month/year
  const byMonth = trips.reduce((acc, t) => {
    if (!t.start_date) return acc;
    const d = new Date(t.start_date);
    if (d.getFullYear() !== currentYear) return acc;
    const m = d.getMonth();
    (acc[m] = acc[m] || []).push(t);
    return acc;
  }, {});

  const activeTrips = active !== null ? (byMonth[active] || []) : [];

  const scroll = (dir) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section data-testid="month-carousel" className="py-16 sm:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-2">{eyebrow}</div>
            <h2 className="font-display text-4xl sm:text-5xl text-text-main leading-tight">{title}</h2>
            <p className="text-text-sec mt-3 max-w-2xl">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button data-testid="year-prev" onClick={() => setCurrentYear((y) => y - 1)}
              className="w-10 h-10 rounded-full bg-white border-2 border-[#E8E6E0] text-text-main hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
            <span className="font-display text-2xl font-bold text-text-main min-w-[60px] text-center">{currentYear}</span>
            <button data-testid="year-next" onClick={() => setCurrentYear((y) => y + 1)}
              className="w-10 h-10 rounded-full bg-white border-2 border-[#E8E6E0] text-text-main hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Rail of month cards */}
        <div className="relative">
          <div ref={railRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 lg:-mx-20 px-5 lg:px-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {MONTH_NAMES.map((name, i) => {
              const count = (byMonth[i] || []).length;
              const isActive = active === i;
              const hasTrips = count > 0;
              return (
                <button
                  key={name}
                  data-testid={`month-card-${i + 1}`}
                  onClick={() => hasTrips && setActive(isActive ? null : i)}
                  disabled={!hasTrips}
                  className={`snap-start flex-shrink-0 min-w-[220px] h-32 rounded-2xl px-6 text-left transition-all duration-200 flex flex-col justify-between
                    ${isActive
                      ? "bg-green-700 text-white ring-4 ring-orange-500 ring-offset-2 ring-offset-white"
                      : hasTrips
                        ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        : "bg-[#D7D6CF] text-text-sec cursor-default opacity-80"}
                  `}
                  style={{ paddingTop: "1.25rem", paddingBottom: "1.25rem" }}
                >
                  <div className="font-display text-2xl">{name}</div>
                  {hasTrips ? (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {count} {count === 1 ? "viaje" : "viajes"}
                    </div>
                  ) : (
                    <div className="text-sm italic opacity-90">Próximamente</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable panel */}
        {expanded && active !== null && (
          <div data-testid="month-panel" className="mt-8 bg-bone border border-[#E8E6E0] rounded-2xl p-5 sm:p-7">
            <div className="text-xs uppercase tracking-[0.2em] text-green-700 font-bold mb-4">
              Viajes en {MONTH_NAMES[active]} {currentYear}
            </div>
            {activeTrips.length === 0 ? (
              <p className="text-text-sec">Aún no hay viajes confirmados este mes.</p>
            ) : (
              <div className="divide-y divide-[#E8E6E0]">
                {activeTrips.map((t) => <PanelRow key={t.id} trip={t} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PanelRow({ trip }) {
  const start = new Date(trip.start_date);
  const end = trip.end_date ? new Date(trip.end_date) : start;
  return (
    <div className="py-4 grid md:grid-cols-12 gap-4 items-center">
      <div className="md:col-span-2 flex items-center gap-3">
        <div className="w-12 h-14 rounded-lg bg-orange-500 text-white flex flex-col items-center justify-center">
          <div className="font-display text-2xl leading-none">{start.getDate()}</div>
          <div className="text-[10px] uppercase font-bold mt-0.5">{MONTH_NAMES[start.getMonth()].slice(0, 3)}</div>
        </div>
        <div className="text-xs text-text-sec">
          <div>{start.getDate()} {start.toLocaleDateString("es-MX", { month: "short" })}</div>
          <div>al {end.getDate()} {end.toLocaleDateString("es-MX", { month: "short" })}</div>
        </div>
      </div>
      <div className="md:col-span-5">
        <div className="font-display text-xl text-text-main leading-tight">{trip.title}</div>
        <div className="text-xs text-text-sec flex items-center gap-1 mt-1"><MapPin size={11} /> {trip.destination}</div>
      </div>
      <div className="md:col-span-2 text-sm">
        <div className="text-[10px] uppercase tracking-wider text-text-sec">desde</div>
        <div className="font-display text-xl text-green-700 font-bold">{fmtMoney(trip.price)}</div>
      </div>
      <div className="md:col-span-3 flex justify-start md:justify-end gap-2">
        <Link to={`/destinos/${trip.id}`} className="btn-orange-outline inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold">
          Ver más <ArrowRight size={14} />
        </Link>
        <a href={waLink(WA_MESSAGES.destinosCalendario(trip.title, trip.start_date, trip.end_date || trip.start_date))} target="_blank" rel="noreferrer"
          className="btn-whatsapp inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold" aria-label="Reservar por WhatsApp">
          <MessageCircle size={14} fill="white" />
        </a>
      </div>
    </div>
  );
}

export { fmtMoney };
