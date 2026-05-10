import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { formatApiError } from "@/lib/api";
import { Calendar, Users, Clock, MapPin, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }); }
  catch { return iso; }
};
const fmtMoney = (n, c = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", people: 1, message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`).then((r) => setTrip(r.data)).catch(() => setTrip(false));
  }, [id]);

  if (trip === null) return <div className="pt-40 text-center text-ink/60">Cargando…</div>;
  if (trip === false) return (
    <div className="pt-40 text-center">
      <p className="text-ink/70 mb-4">Viaje no encontrado.</p>
      <Link to="/viajes" className="text-terracotta font-semibold">Volver al catálogo</Link>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/reservations", { ...form, trip_id: trip.id, people: Number(form.people) });
      toast.success("¡Recibimos tu solicitud! Te contactaremos en menos de 24h.");
      setForm({ name: "", email: "", phone: "", people: 1, message: "" });
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const wa = `https://wa.me/525512345678?text=${encodeURIComponent(`Hola! Me interesa el viaje "${trip.title}".`)}`;

  return (
    <div data-testid="trip-detail-page" className="pt-24 pb-24 bg-bone">
      {/* Hero image */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <img src={trip.cover_image} alt={trip.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <Link to="/viajes" className="text-white/85 inline-flex items-center gap-2 mb-4 hover:text-white">
            <ArrowLeft size={16} /> Volver
          </Link>
          <div className="text-white/85 text-sm flex items-center gap-2 mb-3"><MapPin size={14} /> {trip.destination} · {trip.country}</div>
          <h1 className="font-heading text-5xl sm:text-6xl text-white max-w-3xl leading-tight">{trip.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              <Stat icon={Calendar} label="Salida" value={fmtDate(trip.start_date)} />
              <Stat icon={Clock} label="Duración" value={`${trip.duration_days} día${trip.duration_days > 1 ? "s" : ""}`} />
              <Stat icon={Users} label="Grupo" value={`${trip.group_min}-${trip.group_max}`} />
              <Stat icon={Users} label="Disponibles" value={`${trip.spots_left} lugares`} />
            </div>
            <h2 className="font-heading text-3xl text-ink mb-4">Sobre el viaje</h2>
            <p className="text-ink/75 leading-relaxed text-lg whitespace-pre-line">
              {trip.long_description || trip.description}
            </p>
          </div>

          {trip.itinerary?.length > 0 && (
            <div>
              <h2 className="font-heading text-3xl text-ink mb-6">Itinerario día a día</h2>
              <div className="space-y-4">
                {trip.itinerary.map((d, i) => (
                  <div key={i} className="bg-white border border-[#E5E0D8] rounded-2xl p-6 flex gap-5">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-terracotta text-white flex items-center justify-center font-heading text-xl">
                      {d.day || i + 1}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl text-ink mb-1">{d.title}</h3>
                      <p className="text-ink/70">{d.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {trip.included?.length > 0 && (
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                <h3 className="font-heading text-xl text-ink mb-4">Incluye</h3>
                <ul className="space-y-2">
                  {trip.included.map((it, i) => (
                    <li key={i} className="flex gap-2 text-ink/80"><Check size={18} className="text-terracotta flex-shrink-0 mt-0.5" /> {it}</li>
                  ))}
                </ul>
              </div>
            )}
            {trip.excluded?.length > 0 && (
              <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                <h3 className="font-heading text-xl text-ink mb-4">No incluye</h3>
                <ul className="space-y-2">
                  {trip.excluded.map((it, i) => (
                    <li key={i} className="flex gap-2 text-ink/80"><X size={18} className="text-ink/40 flex-shrink-0 mt-0.5" /> {it}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reservation card */}
        <aside className="lg:sticky lg:top-28 self-start">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl p-7 shadow-soft">
            <div className="text-[10px] uppercase tracking-widest text-ink/50">Desde</div>
            <div className="font-heading text-4xl text-terracotta mb-1">{fmtMoney(trip.price, trip.currency)}</div>
            <div className="text-sm text-ink/60 mb-6">por persona · {trip.duration_days}d</div>

            <form onSubmit={submit} className="space-y-3" data-testid="reservation-form">
              <input data-testid="res-name" required placeholder="Tu nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
              <input data-testid="res-email" required type="email" placeholder="Correo" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
              <input data-testid="res-phone" required placeholder="Teléfono / WhatsApp" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
              <input data-testid="res-people" type="number" min={1} max={trip.spots_left} placeholder="Personas" value={form.people}
                onChange={(e) => setForm({ ...form, people: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
              <textarea data-testid="res-message" rows={3} placeholder="¿Algo que quieras contarnos?" value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
              <button data-testid="res-submit" disabled={submitting}
                className="w-full btn-terracotta py-3.5 rounded-full font-semibold disabled:opacity-60">
                {submitting ? "Enviando…" : "Solicitar reserva"}
              </button>
            </form>

            <a href={wa} target="_blank" rel="noreferrer" data-testid="whatsapp-cta"
              className="mt-3 block w-full text-center py-3 rounded-full font-semibold border border-sage text-sage hover:bg-sage hover:text-white transition-all">
              Escribir por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4">
      <div className="flex items-center gap-2 text-ink/60 text-xs uppercase tracking-wider mb-1">
        <Icon size={12} /> {label}
      </div>
      <div className="font-semibold text-ink text-sm">{value}</div>
    </div>
  );
}
