import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export default function Contact() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ trip_id: "", name: "", email: "", phone: "", people: 1, message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.get("/trips").then((r) => setTrips(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.trip_id) { toast.error("Selecciona un viaje"); return; }
    setSubmitting(true);
    try {
      await api.post("/reservations", { ...form, people: Number(form.people) });
      toast.success("¡Recibimos tu solicitud! Te respondemos en menos de 24h.");
      setForm({ trip_id: "", name: "", email: "", phone: "", people: 1, message: "" });
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    } finally { setSubmitting(false); }
  };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24 bg-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5 space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-4">Hablemos</div>
            <h1 className="font-heading text-5xl sm:text-6xl text-ink leading-tight mb-6">
              ¿Cuándo nos vamos?
            </h1>
            <p className="text-ink/70 text-lg leading-relaxed">
              Reserva tu lugar, pregunta lo que sea, o cuéntanos a dónde sueñas ir. Te respondemos personalmente en menos de 24 horas.
            </p>
          </div>
          <div className="space-y-4">
            <Item icon={MessageCircle} label="WhatsApp" value="+52 55 1234 5678"
              href="https://wa.me/525512345678?text=Hola!%20Me%20interesa%20viajar%20con%20Senderos." />
            <Item icon={Mail} label="Email" value="hola@senderos.mx" href="mailto:hola@senderos.mx" />
            <Item icon={Phone} label="Teléfono" value="+52 55 1234 5678" href="tel:+525512345678" />
            <Item icon={MapPin} label="Base" value="Ciudad de México, México" />
          </div>
        </div>

        <div className="md:col-span-7">
          <form onSubmit={submit} data-testid="contact-form"
            className="bg-white border border-[#E5E0D8] rounded-3xl p-8 shadow-soft space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/60 mb-2 block">Viaje de interés</label>
              <select data-testid="contact-trip-select" required value={form.trip_id}
                onChange={(e) => setForm({ ...form, trip_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta">
                <option value="">— Selecciona un viaje —</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>{t.title} · {t.destination}</option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field name="name" label="Nombre" form={form} setForm={setForm} required />
              <Field name="email" label="Correo" type="email" form={form} setForm={setForm} required />
              <Field name="phone" label="Teléfono / WhatsApp" form={form} setForm={setForm} required />
              <Field name="people" label="Personas" type="number" min={1} max={20} form={form} setForm={setForm} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-ink/60 mb-2 block">Mensaje (opcional)</label>
              <textarea data-testid="contact-message" rows={4} value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
            </div>
            <button data-testid="contact-submit" disabled={submitting}
              className="btn-terracotta px-8 py-3.5 rounded-full font-semibold disabled:opacity-60">
              {submitting ? "Enviando…" : "Enviar solicitud"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", form, setForm, required, ...rest }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-ink/60 mb-2 block">{label}</label>
      <input data-testid={`contact-${name}`} type={type} required={required} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta"
        {...rest} />
    </div>
  );
}

function Item({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="flex items-center gap-4 bg-white border border-[#E5E0D8] rounded-2xl px-5 py-4 hover:border-terracotta transition">
      <div className="w-11 h-11 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center"><Icon size={18} /></div>
      <div>
        <div className="text-xs uppercase tracking-wider text-ink/50">{label}</div>
        <div className="font-semibold text-ink">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}
