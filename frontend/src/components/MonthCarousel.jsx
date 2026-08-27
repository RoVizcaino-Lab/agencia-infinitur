import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const VISIBLE_MONTHS = 5;
const CARD_STEP = 236; // card width (220) + gap (16)

const fmtMoney = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

export default function MonthCarousel({ expanded = true, eyebrow = "CALENDARIO DE AVENTURAS", title = "¿Cuándo te vas de viaje?", subtitle = "Estos son los meses con viajes confirmados. Elige el que más te emocione." }) {
  const [trips, setTrips] = useState([]);
  const [active, setActive] = useState(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const railRef = useRef(null);
  const baselineScrollLeft = useRef(null);

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  // Only months with upcoming confirmed trips, sorted chronologically
  const groups = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const map = new Map();
    trips.forEach((t) => {
      if (!t.start_date) return;
      const d = new Date(t.start_date);
      if (d < now) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, { year: d.getFullYear(), month: d.getMonth(), trips: [] });
      map.get(key).trips.push(t);
    });
    return Array.from(map.values()).sort((a, b) => (a.year - b.year) || (a.month - b.month));
  }, [trips]);

  const activeGroup = groups.find((g) => `${g.year}-${g.month}` === active) || null;
  const activeTrips = activeGroup ? activeGroup.trips : [];
  const showArrows = groups.length > VISIBLE_MONTHS;

  const updateScrollState = () => {
    const el = railRef.current;
    if (!el) return;
    if (baselineScrollLeft.current === null) baselineScrollLeft.current = el.scrollLeft;
    setCanScrollPrev(el.scrollLeft > baselineScrollLeft.current + 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => { baselineScrollLeft.current = null; updateScrollState(); }, [groups]);

  const scroll = (dir) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({ left: dir * CARD_STEP, behavior: "smooth" });
    setTimeout(updateScrollState, 300);
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
          {showArrows && (
            <div className="flex items-center gap-3">
              <button
                data-testid="month-carousel-prev"
                onClick={() => scroll(-1)}
                disabled={!canScrollPrev}
                className={`w-10 h-10 rounded-full bg-white border-2 border-[#E8E6E0] flex items-center justify-center transition-all
                  ${canScrollPrev ? "text-text-main hover:border-orange-500 hover:text-orange-500" : "text-text-sec opacity-40 cursor-not-allowed"}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                data-testid="month-carousel-next"
                onClick={() => scroll(1)}
                disabled={!canScrollNext}
                className={`w-10 h-10 rounded-full bg-white border-2 border-[#E8E6E0] flex items-center justify-center transition-all
                  ${canScrollNext ? "text-text-main hover:border-orange-500 hover:text-orange-500" : "text-text-sec opacity-40 cursor-not-allowed"}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Rail of month cards */}
        <div className="relative">
          {groups.length === 0 ? (
            <p data-testid="month-carousel-empty" className="text-text-sec">Aún no hay viajes confirmados próximamente.</p>
          ) : (
            <div
              ref={railRef}
              onScroll={updateScrollState}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 lg:-mx-20 px-5 lg:px-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {groups.map((g) => {
                const key = `${g.year}-${g.month}`;
                const isActive = active === key;
                const count = g.trips.length;
                return (
                  <button
                    key={key}
                    data-testid={`month-card-${key}`}
                    onClick={() => setActive(isActive ? null : key)}
                    className={`snap-start flex-shrink-0 min-w-[220px] h-32 rounded-2xl px-6 text-left transition-all duration-200 flex flex-col justify-between
                      ${isActive
                        ? "bg-green-700 text-white ring-4 ring-orange-500 ring-offset-2 ring-offset-white"
                        : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"}
                    `}
                    style={{ paddingTop: "1.25rem", paddingBottom: "1.25rem" }}
                  >
                    <div>
                      <div className="font-display text-2xl leading-tight">{MONTH_NAMES[g.month]}</div>
                      <div className="text-xs opacity-80 font-semibold">{g.year}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {count} {count === 1 ? "viaje" : "viajes"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Expandable panel */}
        {expanded && activeGroup && (
          <div data-testid="month-panel" className="mt-8 bg-bone border border-[#E8E6E0] rounded-2xl p-5 sm:p-7">
            <div className="text-xs uppercase tracking-[0.2em] text-green-700 font-bold mb-4">
              Viajes en {MONTH_NAMES[activeGroup.month]} {activeGroup.year}
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
