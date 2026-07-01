import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { resolveImage } from "@/lib/api";
import {
  Calendar, Bus, Home, Star, MessageCircle, Share2, MapPin,
  Bed, Tent, AlertCircle, Download, ChevronRight, ArrowRight,
} from "lucide-react";
import TripCard from "@/components/TripCard";
import { getTripTypeStyle } from "@/lib/tripStyle";
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
    return `${range} · ${duration} día${duration > 1 ? "s" : ""}`;
  } catch { return startIso; }
};

const fmtMoney = (n, c = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

const PAYMENT_METHODS = ["Efectivo", "Depósito", "Transferencia", "Visa / Mastercard", "Meses sin intereses", "PayPal"];
const TIER_ICONS = { tent: Tent, bed: Bed };

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [otherTrips, setOtherTrips] = useState([]);

  useEffect(() => {
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
  const tiers = (trip.pricing_tiers && trip.pricing_tiers.length > 0)
    ? trip.pricing_tiers
    : [{ label: "Por persona", price: trip.price, icon: "bed" }];
  const minTier = tiers.reduce((min, t) => t.price < min.price ? t : min, tiers[0]);
  const fillPct = trip.group_max ? Math.max(8, Math.min(95, 100 - (trip.spots_left / trip.group_max) * 100)) : 50;

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
    <div data-testid="trip-detail-page" className="bg-bone pb-24">
      {/* BREADCRUMB */}
      <div className="pt-28 pb-2">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <nav className="flex items-center gap-2 text-sm text-text-sec">
            <Link to="/destinos" className="text-green-700 font-semibold hover:underline">Destinos</Link>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-green-700 font-semibold">{trip.region}</span>
            <ChevronRight size={14} className="text-text-muted" />
            <span className="text-text-main font-semibold">{trip.title}</span>
          </nav>
        </div>
      </div>

      {/* ILLUSTRATED HEADER */}
      <section className="pt-4">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className={`relative rounded-3xl ${style.bg} overflow-hidden`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <Icon className={style.fg} size={260} strokeWidth={1} />
            </div>
            <div className="relative grid md:grid-cols-12 gap-6 p-6 sm:p-10">
              <div className="md:col-span-8 flex flex-col justify-end">
                <div className="flex gap-2 mb-4 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 bg-white/95 ${style.fg} text-xs font-bold px-3 py-1.5 rounded-full`}>
                    <Icon size={13} /> {trip.trip_type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/95 text-text-main text-xs font-bold px-3 py-1.5 rounded-full">
                    {trip.region}
                  </span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl text-text-main leading-[1.05] tracking-tight mb-3">
                  {trip.title}
                </h1>
                <div className="inline-flex items-center gap-2 text-sm text-text-main/80">
                  <Calendar size={14} className="text-orange-500" />
                  <span className="font-semibold">{fmtDateRange(trip.start_date, trip.end_date, trip.duration_days)}</span>
                </div>
              </div>
              <div className="md:col-span-4 flex items-start md:justify-end">
                <div className="bg-white rounded-2xl shadow-soft px-6 py-5 text-right">
                  <div className="text-[11px] uppercase tracking-widest text-text-sec">desde</div>
                  <div className="font-display text-4xl text-orange-500 font-bold leading-tight">
                    {fmtMoney(minTier.price, trip.currency)}
                  </div>
                  <div className="text-xs text-text-sec mt-0.5">{trip.currency} por persona</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mt-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid lg:grid-cols-3 gap-10">
          {/* LEFT — content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Sobre */}
            <div>
              <h2 className="font-display text-3xl text-text-main mb-4">Sobre este viaje</h2>
              <p className="text-text-sec leading-relaxed text-base sm:text-lg whitespace-pre-line">
                {trip.long_description || trip.description}
              </p>
            </div>

            {/* Lugares */}
            {trip.places?.length > 0 && (
              <div>
                <h2 className="font-display text-3xl text-text-main mb-5">Lugares a visitar</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {trip.places.map((p) => (
                    <div key={p} className="bg-[#F0F7EA] text-green-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                      <MapPin size={14} className="text-green-700" /> {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ¿Qué incluye? */}
            <div>
              <h2 className="font-display text-3xl text-text-main mb-5">
                ¿Qué <em className="italic text-green-700 font-display">incluye</em>?
              </h2>
              <div className="space-y-3">
                <IncludeRow icon={Bus} title="Transporte"
                  desc="Autobús o Camioneta Sprinter con seguro de viajero, A/C, DVD, MP3 y operadores calificados." />
                <IncludeRow icon={Home} title="Hospedaje"
                  desc="Campamento con baños y regaderas. Cabaña u Hotel con todos los servicios (sujeto a disponibilidad)." />
                <IncludeRow icon={Star} title="Coordinador Infinitur"
                  desc="Tu guía que ya te conoce antes de salir. Presente en cada momento del viaje." />
                {(trip.included || []).filter((it) => !["transporte", "hospedaje", "guía", "guia"].some((k) => it.toLowerCase().includes(k))).map((extra) => (
                  <IncludeRow key={extra} icon={Star} title={extra} desc="" small />
                ))}
              </div>
            </div>

            {/* Itinerario */}
            <div>
              <h2 className="font-display text-3xl text-text-main mb-3">Itinerario</h2>
              <p className="text-text-sec mb-5">
                El itinerario completo con todos los detalles del viaje está disponible para descargar.
              </p>
              {trip.itinerary_pdf_url ? (
                <a href={resolveImage(trip.itinerary_pdf_url)} target="_blank" rel="noreferrer"
                  data-testid="download-itinerary"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border-2 border-[#E8E6E0] hover:border-green-700 hover:text-green-700 font-semibold text-sm transition">
                  <Download size={16} /> Descargar itinerario PDF
                </a>
              ) : (
                trip.itinerary?.length > 0 && (
                  <div className="space-y-4 mt-4">
                    {trip.itinerary.map((d, i) => (
                      <div key={`day-${d.day ?? i}-${d.title}`} className="bg-white border border-[#E8E6E0] rounded-2xl p-5 sm:p-6 flex gap-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-display text-lg font-bold">
                          {d.day || i + 1}
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-text-main mb-1">{d.title}</h3>
                          <p className="text-text-sec">{d.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT — sticky aside */}
          <aside className="lg:sticky lg:top-28 self-start space-y-5">
            {/* Cupo */}
            <div className="bg-[#FFE8D8] border border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-2">
                <AlertCircle size={16} /> Cupo limitado
              </div>
              <div className="h-2 bg-white/70 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-orange-500" style={{ width: `${fillPct}%` }} />
              </div>
              <p className="text-xs text-text-sec leading-relaxed">
                Quedan pocos lugares disponibles. Aparta el tuyo pronto.
              </p>
            </div>

            {/* Costo por viajero */}
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6">
              <h3 className="font-display text-xl text-text-main mb-4">Costo por viajero</h3>
              <ul className="space-y-3">
                {tiers.map((t) => {
                  const TierIcon = TIER_ICONS[t.icon] || Bed;
                  return (
                    <li key={t.label} className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm text-text-main">
                        <TierIcon size={15} className="text-green-700" /> {t.label}
                      </span>
                      <span className="font-display text-lg text-orange-500 font-bold">{fmtMoney(t.price, trip.currency)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[11px] text-text-sec mt-4 leading-relaxed">
                Hospedaje en hotel o cabaña sujeto a disponibilidad. Todos los precios en {trip.currency}.
              </p>
            </div>

            {/* Formas de pago */}
            <div className="bg-white border border-[#E8E6E0] rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-[0.25em] text-text-sec font-bold mb-3">Formas de pago</div>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((p) => (
                  <span key={p} className="bg-[#F5F2EC] text-text-main text-xs font-semibold px-3 py-1.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>

            {/* Reservar WhatsApp */}
            <a href={waLink(waMsg)} target="_blank" rel="noreferrer"
              data-testid="reserve-whatsapp"
              className="btn-whatsapp w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-bold">
              <MessageCircle size={18} fill="white" /> Reservar por WhatsApp
            </a>
            <div className="text-center text-green-700 font-bold">{WA_DISPLAY}</div>

            {/* Share */}
            <button onClick={shareTrip}
              data-testid="share-trip"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border-2 border-[#E8E6E0] hover:border-green-700 hover:text-green-700 text-sm font-semibold transition">
              <Share2 size={15} /> Compartir este viaje
            </button>
          </aside>
        </div>
      </section>

      {/* OTROS DESTINOS */}
      {similar.length > 0 && (
        <section className="mt-24">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
            <h2 className="font-display text-3xl sm:text-4xl text-text-main mb-8">
              Otros destinos que te pueden <em className="italic text-green-700 font-display">gustar</em>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {similar.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA DARK */}
      <section className="mt-24 bg-[#1B1B1A] text-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-20 py-16 text-center">
          <h2 className="font-display text-4xl sm:text-5xl mb-4">
            ¿Tienes alguna duda? <em className="italic text-green-300 font-display">Escríbenos.</em>
          </h2>
          <p className="text-white/75 max-w-2xl mx-auto mb-8">
            Estamos en WhatsApp para resolver cualquier pregunta sobre este viaje o cualquier otro destino.
          </p>
          <a href={waLink(waMsg)} target="_blank" rel="noreferrer"
            data-testid="dark-cta-whatsapp"
            className="btn-whatsapp inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold">
            <MessageCircle size={18} fill="white" /> {WA_DISPLAY}
          </a>
        </div>
      </section>

      <ArrowRight className="hidden" /> {/* keep import used */}
    </div>
  );
}

function IncludeRow({ icon: Icon, title, desc, small = false }) {
  return (
    <div className="bg-white border border-[#E8E6E0] rounded-2xl p-5 flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F0F7EA] text-green-700 flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <div className={`font-bold text-text-main ${small ? "text-sm" : ""}`}>{title}</div>
        {desc && <div className="text-sm text-text-sec mt-0.5 leading-relaxed">{desc}</div>}
      </div>
    </div>
  );
}
