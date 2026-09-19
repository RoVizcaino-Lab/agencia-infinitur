import { useEffect, useState } from "react";
import {
  Calendar, Stethoscope, CalendarX, FileText, ChevronDown,
  Sprout, AlertCircle, Check,
} from "lucide-react";
import api from "@/lib/api";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";
import { waLink, WA_MESSAGES, WA_DISPLAY } from "@/lib/whatsapp";

const TABS = [
  { key: "reservar", icon: Calendar, title: "¿Cómo reservar?", sub: "Anticipo, formas de pago y tiempos mínimos", iconBg: "bg-[#D6EDCA]", iconFg: "text-green-700" },
  { key: "seguro", icon: Stethoscope, title: "Seguro médico", sub: "Qué cubre y cómo contratarlo", iconBg: "bg-[#D6EDCA]", iconFg: "text-green-700" },
  { key: "cancelacion", icon: CalendarX, title: "Cancelaciones", sub: "Plazos, devoluciones y cambios", iconBg: "bg-[#FFE0C8]", iconFg: "text-orange-600" },
  { key: "politicas", icon: FileText, title: "Políticas de viaje", sub: "Coordinadores, transporte y hospedaje", iconBg: "bg-[#ECEAE4]", iconFg: "text-text-main" },
];

export default function FAQ() {
  const [active, setActive] = useState("reservar");

  return (
    <div data-testid="faq-page" className="bg-white pb-20">
      {/* HERO */}
      <section className="pt-32 pb-10 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-4">Tu guía de viaje</div>
          <h1 className="font-display text-5xl sm:text-6xl text-text-main leading-[1.05] tracking-tight mb-5">
            Todo lo que debes saber antes de aventurarte
          </h1>
          <p className="text-text-sec text-lg">
            Selecciona el tema que te interesa – te mostramos exactamente lo que necesitas.
          </p>
        </div>
      </section>

      {/* 4 TABS */}
      <section className="pb-10">
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TABS.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  data-testid={`faq-tab-${t.key}`}
                  onClick={() => setActive(t.key)}
                  className={`text-center p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                    isActive
                      ? "border-green-700 bg-white shadow-soft"
                      : "border-transparent bg-[#F2F0EB] hover:bg-white hover:border-[#E8E6E0]"
                  }`}
                >
                  <div className={`mx-auto w-12 h-12 rounded-lg ${t.iconBg} ${t.iconFg} flex items-center justify-center mb-3`}>
                    <t.icon size={22} />
                  </div>
                  <div className="font-display text-lg text-text-main leading-tight mb-1">{t.title}</div>
                  <div className="text-xs text-text-sec">{t.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="max-w-[1100px] mx-auto px-5"><hr className="border-[#E8E6E0]" /></div>

      {/* PANEL */}
      <section className="pt-10">
        <div className="max-w-[1100px] mx-auto px-5">
          {active === "reservar" && <ReservarPanel />}
          {active === "seguro" && <SeguroPanel />}
          {active === "cancelacion" && <CancelacionPanel />}
          {active === "politicas" && <PoliticasPanel />}
        </div>
      </section>

      {/* WHATSAPP BANNER FOOTER */}
      <section className="pt-12">
        <div className="max-w-[1100px] mx-auto px-5">
          <WaBanner
            title={waBannerTitle(active)}
            sub="Escríbenos — respondemos en menos de 24 horas."
            message={waBannerMsg(active)}
          />
        </div>
      </section>
    </div>
  );
}

function waBannerTitle(tab) {
  switch (tab) {
    case "seguro": return "¿Quieres contratar el seguro?";
    case "cancelacion": return "¿Necesitas cancelar o hacer un cambio?";
    case "politicas": return "¿Tienes alguna duda?";
    default: return "¿Tienes más dudas?";
  }
}
function waBannerMsg(tab) {
  switch (tab) {
    case "seguro": return WA_MESSAGES.seguro;
    case "cancelacion": return WA_MESSAGES.cancelaciones;
    default: return WA_MESSAGES.general;
  }
}

function ReservarPanel() {
  const cards = [
    { title: "Efectivo", desc: "Con cita en el punto de venta u oficina de Viajes Infinitur." },
    { title: "Depósito o transferencia", desc: "Envía tu comprobante a viajes@infinitur.com" },
    { title: "Tarjeta de crédito", desc: "Con cita en el punto de venta u oficina de Viajes Infinitur." },
    { title: "Tiempo mínimo", desc: "1 sem. viajes cortos · 2 sem. largos · 1 mes internacionales." },
  ];
  return (
    <PanelLayout eyebrow="Reservaciones" title="¿Cómo reservar?" sub="Para apartar tu lugar hay que entregar el anticipo especificado en el itinerario de cada viaje.">
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="bg-[#F2F0EB] rounded-2xl p-5 flex gap-3 items-start">
            <div className="w-9 h-9 rounded-lg bg-[#D6EDCA] text-green-700 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="font-bold text-text-main mb-0.5">{c.title}</div>
              <div className="text-sm text-text-sec">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <CmsFaqList
        questions={[
          "¿Cuándo debo liquidar el total del viaje?",
          "¿Puedo reservar para otra persona?",
          "¿Son transferibles las reservaciones?",
          "¿Hay descuentos disponibles?",
          "¿Cómo confirmo mi reservación?",
        ]}
      />
    </PanelLayout>
  );
}

function SeguroPanel() {
  return (
    <PanelLayout eyebrow="Seguro médico" title="Viaja tranquilo — estás cubierto" sub="Un seguro de viaje te da tranquilidad ante cualquier eventualidad en el camino.">
      <div className="bg-[#F2F0EB] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#D6EDCA] text-green-700 flex items-center justify-center">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="font-display text-lg text-text-main">Seguro Médico Infinitur — Seguros April</div>
            <div className="text-xs text-text-sec">Costo adicional · Contratación opcional</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { t: "Asistencia médica", s: "Las 24 hrs, los 365 días" },
            { t: "Red mundial", s: "47 oficinas · 150 representantes" },
            { t: "Atención en tu idioma", s: "Red propia de asistencia" },
            { t: "Cobertura de imprevistos", s: "No solo médica" },
          ].map((item) => (
            <div key={item.t} className="bg-white rounded-xl px-4 py-3 flex items-start gap-2">
              <Check size={16} className="text-green-700 flex-shrink-0 mt-1" />
              <div>
                <div className="font-bold text-text-main">{item.t}</div>
                <div className="text-xs text-text-sec">{item.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#F2F0EB] border border-orange-200 rounded-2xl p-5 flex gap-3 items-start">
        <AlertCircle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-main leading-relaxed">
          <strong>Importante:</strong> El seguro incluido en Infinitur solo ampara accidentes dentro del autobús.
          El Seguro April con cobertura completa es adicional y opcional. Para contratarlo escríbenos por WhatsApp o a <span className="font-semibold">viajes@infinitur.com</span>.
        </p>
      </div>
    </PanelLayout>
  );
}

function CancelacionPanel() {
  const [side, setSide] = useState("viajero");
  const viajero = [
    "Si cancelas con más de 10 días naturales antes de la salida, se descuenta el 50% del anticipo.",
    "Durante los últimos 6 días naturales previos a la salida, no hay devolución.",
    "Tu reservación puede transferirse a otra persona, pero no abonarse a otro viaje.",
    "Infinitur no devuelve servicios que se llevaron a cabo aunque el viajero no los haya tomado.",
    "Si abandonas el viaje por decisión propia, no hay abonos por servicios no aprovechados.",
    "Si cancelaste antes de 7 días, tienes un mes posterior para solicitar devolución del anticipo.",
  ];
  const infinitur = [
    "Para salir en autobús se requiere un mínimo de 25 lugares reservados.",
    "Con 12 personas, Infinitur puede decidir realizar el viaje en camioneta Sprinter.",
    "Si no se alcanza el mínimo, Infinitur puede cancelar hasta 2 días antes.",
    "En cancelación por cupo, se devuelve el 100% del pago o se aplica a otro viaje.",
    "Infinitur puede cancelar hasta 3 días antes por causa de fuerza mayor.",
    "Infinitur puede retrasar o cancelar por conflictos sociales, clima o seguridad, dando aviso oportuno.",
  ];

  return (
    <PanelLayout eyebrow="Cancelaciones y cambios" title="Lee esto antes de reservar" sub="Para que no haya sorpresas. Todo claro y por escrito.">
      <div className="inline-flex bg-white border border-[#E8E6E0] rounded-full p-1 mb-2">
        <ToggleBtn active={side === "viajero"} onClick={() => setSide("viajero")} label="Por parte del viajero" />
        <ToggleBtn active={side === "infinitur"} onClick={() => setSide("infinitur")} label="Por parte de Infinitur" />
      </div>
      <div className="bg-[#F2F0EB] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#D6EDCA] text-green-700 flex items-center justify-center">
            <CalendarX size={18} />
          </div>
          <div className="font-bold text-text-main">{side === "viajero" ? "Por parte del viajero" : "Por parte de Infinitur"}</div>
        </div>
        <ol className="space-y-2 text-sm text-text-main/90 list-decimal pl-5">
          {(side === "viajero" ? viajero : infinitur).map((it) => <li key={it}>{it}</li>)}
        </ol>
      </div>
    </PanelLayout>
  );
}

function PoliticasPanel() {
  return (
    <PanelLayout eyebrow="Políticas del viaje" title="Lo más importante antes de salir" sub="Para que no haya sorpresas. Todo claro y por escrito.">
      <CmsFaqList
        questions={[
          "¿Qué hace el coordinador de viaje?",
          "¿Cómo funciona el hospedaje?",
          "¿Qué pasa si el autobús tiene una falla mecánica?",
          "¿Infinitur es responsable de mis pertenencias?",
          "¿Qué pasa si tengo una enfermedad o condición médica?",
          "¿Puedo llevar niños o hay restricciones de edad?",
        ]}
      />
      <div className="bg-[#F2F0EB] border border-orange-200 rounded-2xl p-5 flex gap-3 items-start">
        <Sprout size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-main leading-relaxed">
          <strong>Nuestra promesa:</strong> Infinitur planea y lleva a cabo cada recorrido de buena fe, con la intención de que
          más personas tengan acceso a las maravillas naturales y culturales de nuestro país y el mundo.
        </p>
      </div>
    </PanelLayout>
  );
}

function PanelLayout({ eyebrow, title, sub, children }) {
  return (
    <div className="space-y-6">
      <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold">{eyebrow}</div>
      <h2 className="font-display text-3xl sm:text-4xl text-text-main leading-tight">{title}</h2>
      <p className="text-text-sec mb-2">{sub}</p>
      {children}
    </div>
  );
}

function ToggleBtn({ active, onClick, label }) {
  return (
    <button
      data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
        active ? "bg-green-700 text-white" : "text-text-main hover:text-green-700"
      }`}
    >
      {label}
    </button>
  );
}

// Reuses CMS faq for accordion-style questions; falls back to dummy answers.
function CmsFaqList({ questions }) {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/faq").then((r) => setFaqs(r.data || []));
  }, []);

  const items = questions.map((q) => {
    const match = faqs.find((f) => f.question.toLowerCase().includes(q.toLowerCase().slice(0, 12)));
    return { question: q, answer: match?.answer || "Próximamente. Escríbenos por WhatsApp y te resolvemos esta duda al momento." };
  });

  return (
    <div className="space-y-3 mt-4">
      {items.map((f, i) => (
        <div key={f.question} className={`bg-[#F2F0EB] rounded-2xl overflow-hidden ${open === i ? "ring-2 ring-orange-300" : ""}`}>
          <button
            data-testid={`accordion-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
          >
            <span className="font-bold text-text-main">{f.question}</span>
            <ChevronDown size={18} className={`text-orange-600 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="px-5 pb-5 text-sm text-text-main/80 leading-relaxed">{f.answer}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WaBanner({ title, sub, message }) {
  return (
    <div className="bg-[#EAF5DC] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <span className="text-whatsapp flex-shrink-0">
          <WhatsAppGlyph size={26} />
        </span>
        <div>
          <div className="font-display text-[19px] text-text-main">{title}</div>
          <div className="text-sm text-text-sec">{sub}</div>
        </div>
      </div>
      <a href={waLink(message)} target="_blank" rel="noreferrer"
        data-testid="faq-wa-cta"
        className="btn-whatsapp inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap">
        <WhatsAppGlyph size={16} /> {WA_DISPLAY}
      </a>
    </div>
  );
}
