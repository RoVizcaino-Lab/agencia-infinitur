import { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { waLink, WA_MESSAGES, WA_DISPLAY } from "@/lib/whatsapp";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";

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
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setSubmitting(false); }
  };

  return (
    <div data-testid="contact-page" className="bg-bone pb-24">
      {/* HERO */}
      <section className="pt-32 pb-12">
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-4">Contáctanos</div>
          <h1 className="font-display text-5xl sm:text-6xl text-text-main leading-[1.05] tracking-tight mb-5">
            ¿Cuándo nos <em className="italic text-green-700 font-display">vamos</em>?
          </h1>
          <p className="text-text-sec text-lg max-w-2xl mx-auto">
            Reserva tu lugar, pregunta lo que sea, o cuéntanos a dónde sueñas ir. Te respondemos personalmente en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* WHATSAPP HERO CTA */}
      <section className="pb-12">
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8">
          <a
            href={waLink(WA_MESSAGES.navbar)}
            target="_blank" rel="noreferrer"
            data-testid="contact-wa-hero"
            className="block bg-[#E8F5DC] hover:bg-[#D6EDCA] rounded-3xl p-8 sm:p-10 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-whatsapp text-white flex items-center justify-center shadow-soft">
                  <WhatsAppGlyph size={28} />
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl text-text-main leading-tight">Escríbenos por WhatsApp</div>
                  <div className="text-text-sec mt-1">Es el canal más rápido para resolver tus dudas.</div>
                </div>
              </div>
              <div className="btn-whatsapp inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold">
                {WA_DISPLAY}
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* CONTACT DETAILS + FORM */}
      <section>
        <div className="max-w-[1100px] mx-auto px-5 lg:px-8 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <h2 className="font-display text-3xl text-text-main">Otras vías</h2>
            <Item icon={WhatsAppGlyph} label="WhatsApp" value={WA_DISPLAY} href={waLink(WA_MESSAGES.navbar)} />
            <Item icon={Mail} label="Email" value="viajes@infinitur.com" href="mailto:viajes@infinitur.com" />
            <Item icon={Phone} label="Teléfono" value={WA_DISPLAY} href={`tel:+52${WA_DISPLAY.replace(/\s+/g, "")}`} />
            <Item icon={MapPin} label="Base" value="Ciudad de México, México" />
          </div>

          <div className="md:col-span-7">
            <form onSubmit={submit} data-testid="contact-form"
              className="bg-white border border-[#E8E6E0] rounded-3xl p-7 sm:p-8 shadow-soft space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-text-sec mb-2 block font-bold">Viaje de interés</label>
                <select data-testid="contact-trip-select" required value={form.trip_id}
                  onChange={(e) => setForm({ ...form, trip_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E6E0] bg-bone focus:outline-none focus:border-orange-500">
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
                <label className="text-xs uppercase tracking-wider text-text-sec mb-2 block font-bold">Mensaje (opcional)</label>
                <textarea data-testid="contact-message" rows={4} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E6E0] bg-bone focus:outline-none focus:border-orange-500" />
              </div>
              <button data-testid="contact-submit" disabled={submitting}
                className="btn-orange inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold disabled:opacity-60">
                {submitting ? "Enviando…" : <>Enviar solicitud <Send size={16} /></>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ name, label, type = "text", form, setForm, required, ...rest }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-text-sec mb-2 block font-bold">{label}</label>
      <input data-testid={`contact-${name}`} type={type} required={required} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-[#E8E6E0] bg-bone focus:outline-none focus:border-orange-500"
        {...rest} />
    </div>
  );
}

function Item({ icon: Icon, label, value, href }) {
  const inner = (
    <div className="flex items-center gap-4 bg-white border border-[#E8E6E0] rounded-2xl px-5 py-4 hover:border-green-700 transition">
      <div className="w-11 h-11 rounded-full bg-[#F0F7EA] text-green-700 flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-text-sec font-bold">{label}</div>
        <div className="font-semibold text-text-main">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{inner}</a> : inner;
}
