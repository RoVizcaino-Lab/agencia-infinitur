import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImage } from "@/lib/api";
import {
  Calendar, Bus, Home, Star, Share2, MapPin,
  Bed, Tent, Flame, Download, ChevronRight, Check,
} from "lucide-react";
import TripCard, { allDates } from "@/components/TripCard";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";
import { getTripTypeStyle, getRegionStyle } from "@/lib/tripStyle";
import { waLink, WA_DISPLAY } from "@/lib/whatsapp";
import { toast } from "sonner";

const MONTHS_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const fmtDateRange = (startIso, endIso, duration) => {
  try {
    const s = new Date(startIso);
    const e = endIso ? new Date(endIso) : s;
    const sDay = s.getDate(); const eDay = e.getDate();
    const sM = MONTHS_ES[s.getMonth()]; const yr = e.getFullYear();
    const range = (s.getMonth() === e.getMonth())
      ? `${sDay} al ${eDay} de ${sM}, ${yr}`
      : `${sDay} ${sM} al ${eDay} ${MONTHS_ES[e.getMonth()]}, ${yr}`;
    return `${range} – ${duration} día${duration > 1 ? "s" : ""}`;
  } catch { return startIso; }
};

const fmtMoney = (n) => `$${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(n || 0)}`;

const PAYMENT_METHODS = ["Efectivo", "Depósito", "Transferencia", "Visa / Mastercard", "Meses sin intereses", "Paypal"];
const TIER_ICONS = { tent: Tent, bed: Bed };
const DEFAULT_EXCLUDED = [
  "Alimentos",
  "Gastos personales",
  "Seguro Médico",
  "Actividades Extras",
];

const rangeDays = (startIso, endIso) => {
  try {
    const s = new Date(startIso);
    const e = endIso ? new Date(endIso) : s;
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  } catch { return 1; }
};

const DEFAULT_TRANSPORT = [
  "Autobús o Camioneta Sprinter con seguro de viajero",
  "A/C, DVD y MP3",
  "Operadores calificados",
];

const DEFAULT_LODGING = [
  "Campamento con baños y regaderas",
  "Cabaña u Hotel con todos los servicios (sujeto a disponibilidad)",
];

const DEFAULT_COORDINATOR = [
  "Tu guía que ya te conoce antes de salir",
  "Presente en cada momento del viaje",
];

const DEFAULT_DEPARTURE_POINTS = [
  "Metro Chabacano",
  "Metro Cuatro Caminos",
  "Metro Taxqueña",
];

const toList = (raw, fallback = []) => {
  if (!raw) return fallback;
  return raw.split(/\n|·|;|,/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean);
};

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [otherTrips, setOtherTrips] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/trips/${id}`).then((r) => setTrip(r.data)).catch(() => setTrip(false));
    api.get("/trips").then((r) => setOtherTrips(r.data));
  }, [id]);

  if (trip === null) return <div className="pt-40 text-center text-text-sec">Cargando…</div>;
  if (trip === false) return (
    <div className="pt-40 text-center">
      <p className="text-text-sec mb-4">Viaje no encontrado.</p>
      <Link to="/destinos" className="text-orange-500 font-semibold">Volver al catálogo</Link>
    </div>
  );

  const style = getTripTypeStyle(trip.trip_type);
  const Icon = style.icon;
  const region = getRegionStyle(trip.region || "Nacional");
  const RegionIcon = region.icon;
  const tiers = (trip.pricing_tiers && trip.pricing_tiers.length > 0)
    ? trip.pricing_tiers
    : [{ label: "Por persona", price: trip.price, icon: "bed" }];
  const minTier = tiers.reduce((min, t) => t.price < min.price ? t : min, tiers[0]);
  const fillPct = trip.group_max ? Math.max(8, Math.min(95, 100 - (trip.spots_left / trip.group_max) * 100)) : 50;
  const excluded = (trip.excluded && trip.excluded.length > 0) ? trip.excluded : DEFAULT_EXCLUDED;
  const extras = (trip.included || []).filter(
    (it) => !["transporte", "hospedaje", "guía", "guia", "coordinador"].some((k) => it.toLowerCase().includes(k))
  );

  const waMsg = `Hola! Me interesa reservar el viaje "${trip.title}" (${fmtDateRange(trip.start_date, trip.end_date, trip.duration_days)}). ¿Me ayudan con los detalles?`;
  const shareTrip = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: trip.title, url }); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copiado al portapapeles");
      } catch {
        toast.error("No se pudo copiar el link");
      }
    }
  };

  const similar = otherTrips.filter((t) => t.id !== trip.id).slice(0, 3);

  return (
    <div data-testid="trip-detail-page" className="bg-bone">
      {/* BREADCRUMB BAR */}
      <div className="bg-[#F0EEE8] border-b border-[#E8E6E0]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-3.5">
          <nav className="flex items-center gap-2 text-[13px]">
            <Link to="/destinos" className="text-green-700 font-semibold hover:underline">Destinos</Link>
            <ChevronRight size={13} className="text-text-sec/60" />
            <span className="text-green-700 font-semibold">{trip.region}</span>
            <ChevronRight size={13} className="text-text-sec/60" />
            <span className="text-text-main font-semibold">{trip.title}</span>
          </nav>
        </div>
      </div>

      {/* PHOTO HERO */}
      <section data-testid="trip-hero" className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[440px] overflow-hidden">
        <img
          src={resolveImage(trip.cover_image)}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[440px] max-w-[1440px] mx-auto px-5 lg:px-20 flex flex-col justify-end pt-24 pb-10">
          <div className="absolute top-6 right-5 lg:right-20">
            <div className="bg-[#F5F2EC] rounded-2xl px-6 py-4 text-center shadow-floating">
              <div className="text-[11px] text-text-sec">desde</div>
              <div className="font-display text-[32px] text-text-main font-bold leading-none">
                {fmtMoney(minTier.price)}
              </div>
              <div className="text-[11px] text-text-sec mt-1">{trip.currency || "MXN"} por persona</div>
            </div>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 ${style.chip} text-[11px] font-bold px-3 py-1 rounded-full`}>
              <Icon size={12} /> {trip.trip_type}
            </span>
            <span className={`inline-flex items-center gap-1.5 ${region.chip} text-[11px] font-bold px-3 py-1 rounded-full`}>
              <RegionIcon size={12} /> {region.key}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] text-white leading-[1.05] tracking-tight mb-2.5 max-w-3xl">
            {trip.title}
          </h1>
          <div className="space-y-1" data-testid="trip-hero-dates">
            {allDates(trip).map((d, i) => (
              <div key={`hero-${d.start_date}-${i}`} className="flex items-center gap-2 text-sm text-white/90">
                <Calendar size={14} className="text-orange-400 flex-shrink-0" />
                <span className="font-medium">{fmtDateRange(d.start_date, d.end_date, rangeDays(d.start_date, d.end_date))}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-14">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid lg:grid-cols-3 gap-12">
          {/* LEFT — content */}
          <div className="lg:col-span-2">
            {/* Sobre */}
            <Block>
              <h2 className="font-display text-[30px] text-text-main mb-4">Sobre este viaje</h2>
              <p className="text-text-sec leading-relaxed whitespace-pre-line">
                {trip.long_description || trip.description}
              </p>
            </Block>

            {/* Fechas de salida */}
            <Block divider>
              <h2 className="font-display text-[30px] text-text-main mb-5">Fechas de salida</h2>
              <ul className="space-y-2.5" data-testid="trip-dates-list">
                {allDates(trip).map((d, i) => (
                  <li key={`${d.start_date}-${i}`} className="flex items-center gap-3 bg-white border border-[#E8E6E0] rounded-xl px-4 py-3">
                    <Calendar size={15} className="text-orange-500 flex-shrink-0" />
                    <span className="text-[15px] text-text-main font-medium">
                      {fmtDateRange(d.start_date, d.end_date, rangeDays(d.start_date, d.end_date))}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>

            {/* Lugares */}
            {trip.places?.length > 0 && (
              <Block divider>
                <h2 className="font-display text-[30px] text-text-main mb-5">Lugares a visitar</h2>
                <div className="flex flex-wrap gap-2.5" data-testid="trip-places">
                  {trip.places.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3.5 py-1.5 rounded-full text-[13px] font-semibold">
                      <MapPin size={13} className="text-green-700" /> {p}
                    </span>
                  ))}
                </div>
              </Block>
            )}

            {/* ¿Qué incluye? */}
            <Block divider>
              <h2 className="font-display text-[30px] text-text-main mb-5">¿Qué incluye?</h2>
              <div className="space-y-3">
                <IncludeRow icon={Bus} title="Transporte"
                  items={toList(trip.included_transport, DEFAULT_TRANSPORT)} />
                <IncludeRow icon={Home} title="Hospedaje"
                  items={toList(trip.included_lodging, DEFAULT_LODGING)} />
                <IncludeRow icon={Star} title="Coordinador Infinitur"
                  items={DEFAULT_COORDINATOR} />
                <IncludeRow icon={MapPin} title="Puntos de salida - CDMX"
                  items={toList(trip.departure_points, DEFAULT_DEPARTURE_POINTS)} />
                {extras.length > 0 && (
                  <IncludeRow icon={Check} title="También incluye" items={extras} />
                )}
              </div>
            </Block>

            {/* No incluye */}
            <Block divider>
              <h2 className="font-display text-[30px] text-text-main mb-5">No incluye</h2>
              <ul className="space-y-2.5" data-testid="trip-excluded">
                {excluded.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-text-sec text-[15px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-sec/40 mt-2 flex-shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </Block>

            {/* Itinerario */}
            <Block divider>
              <h2 className="font-display text-[30px] text-text-main mb-3">Itinerario</h2>
              <p className="text-text-sec mb-5">
                El itinerario completo con todos los detalles del viaje está disponible para descargar.
              </p>
              {trip.itinerary_pdf_url ? (
                <a href={resolveImage(trip.itinerary_pdf_url)} target="_blank" rel="noreferrer"
                  data-testid="download-itinerary"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E8E6E0] hover:border-green-700 hover:text-green-700 font-semibold text-sm transition-colors">
                  <Download size={16} className="text-orange-500" /> Descargar itinerario PDF
                </a>
              ) : (
                <span
                  data-testid="download-itinerary"
                  aria-disabled="true"
                  title="El itinerario PDF estará disponible pronto"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#E8E6E0] text-text-sec/60 font-semibold text-sm cursor-not-allowed"
                >
                  <Download size={16} className="text-orange-500/50" /> Descargar itinerario PDF
                </span>
              )}
            </Block>
          </div>

          {/* RIGHT — sticky aside */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="bg-white border border-[#E8E6E0] rounded-3xl p-5 space-y-5 shadow-soft">
              {/* Cupo */}
              <div className="bg-[#FFF1E4] border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-orange-600 font-bold mb-3">
                  <Flame size={17} /> Cupo limitado
                </div>
                <div className="h-2.5 bg-white rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${fillPct}%` }} />
                </div>
                <p className="text-[12px] text-orange-700/80 leading-relaxed">
                  Quedan pocos lugares disponibles.<br />Aparta el tuyo pronto.
                </p>
              </div>

              {/* Costo por viajero */}
              <div className="border border-[#E8E6E0] rounded-2xl p-5">
                <h3 className="font-display text-[19px] text-text-main mb-4">Costo por viajero</h3>
                <ul className="space-y-3.5">
                  {tiers.map((t) => {
                    const TierIcon = TIER_ICONS[t.icon] || Bed;
                    return (
                      <li key={t.label} className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[14px] text-text-main">
                          <TierIcon size={15} className="text-green-700" /> {t.label}
                        </span>
                        <span className="font-display text-[17px] text-text-main font-bold">{fmtMoney(t.price)}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[11px] text-text-sec mt-4 leading-relaxed">
                  Hospedaje en hotel o cabaña sujeto a disponibilidad. Todos los precios en {trip.currency || "MXN"}.
                </p>
              </div>

              {/* Formas de pago */}
              <div className="border border-[#E8E6E0] rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.16em] text-text-main font-bold mb-3.5">Formas de pago</div>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((p) => (
                    <span key={p} className="bg-[#F5F2EC] text-text-main text-[12px] font-medium px-3.5 py-1.5 rounded-full">{p}</span>
                  ))}
                </div>
              </div>

              {/* Reservar WhatsApp */}
              <a href={waLink(waMsg)} target="_blank" rel="noreferrer"
                data-testid="reserve-whatsapp"
                className="btn-whatsapp w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold">
                <WhatsAppGlyph size={18} /> Reservar por Whatsapp
              </a>

              {/* Share */}
              <button onClick={shareTrip}
                data-testid="share-trip"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-[#E8E6E0] hover:border-green-700 hover:text-green-700 text-sm font-semibold transition-colors">
                <Share2 size={15} /> Compartir este viaje
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* OTROS DESTINOS */}
      {similar.length > 0 && (
        <section className="pb-20">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
            <h2 className="font-display text-[32px] sm:text-4xl text-text-main mb-8">
              Otros destinos que te pueden gustar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* BANNER WHATSAPP */}
      <section className="bg-carbon text-white py-14">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white">
              ¿Tienes alguna duda?<br />
              <span className="text-whatsapp italic">¡Escríbenos!</span>
            </h2>
            <p className="text-white/70 mt-4 max-w-md">
              Estamos en WhatsApp para resolver cualquier pregunta — desde cómo funciona Infinitur hasta los detalles de tu próximo viaje.
              <span className="font-bold"> Sin formularios, sin esperas.</span>
            </p>
          </div>
          <div className="md:text-right">
            <a href={waLink(waMsg)} target="_blank" rel="noreferrer"
              data-testid="dark-cta-whatsapp"
              className="btn-whatsapp inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base mb-3">
              <WhatsAppGlyph size={20} /> Contáctanos
            </a>
            <div className="font-display text-3xl text-whatsapp font-bold tracking-wide">{WA_DISPLAY}</div>
            <div className="text-xs text-white/60 mt-1">Lunes a domingo · Respondemos en menos de 24 hrs</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Block({ children, divider = false }) {
  return (
    <div className={divider ? "mt-10 pt-10 border-t border-[#E3DFD6]" : ""}>
      {children}
    </div>
  );
}

function IncludeRow({ icon: Icon, title, desc, items, small = false }) {
  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl p-5 flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F0F7EA] text-green-700 flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <div className={`font-display text-text-main ${small ? "text-base" : "text-[19px]"}`}>{title}</div>
        {desc && <div className="text-[13px] text-text-sec mt-1 leading-relaxed">{desc}</div>}
        {items?.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-2 text-[13px] text-text-sec leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                {it}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
