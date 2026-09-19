import { Link } from "react-router-dom";
import { ArrowRight, Users, Route, Heart, Star } from "lucide-react";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";
import { TRIP_TYPES, TRIP_TYPE_DESCRIPTIONS } from "@/lib/tripStyle";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const COLLAGE = [
  "https://customer-assets-gfyr7b9c.emergentagent.net/job_grupos-expedicion/artifacts/oh5y7bg7_Conocenos_1.jpg",
  "https://customer-assets-gfyr7b9c.emergentagent.net/job_grupos-expedicion/artifacts/drny2p54_Conocenos_2.jpg",
  "https://customer-assets-gfyr7b9c.emergentagent.net/job_grupos-expedicion/artifacts/rbp3latd_Conocenos_3.jpg",
];

const FOUNDER_PHOTO =
  "https://customer-assets.emergentagent.com/job_grupos-expedicion/artifacts/4rw8xqhn_Infinitur%20Im%C3%A1genes_Con%C3%B3cenos_1.jpg";

const DIFERENCIAS = [
  {
    icon: Users,
    title: ["Grupos chicos,", "conexiones grandes"],
    desc: "Máximo 15 personas por salida. Conoces a todos por nombre antes de llegar. No hay anonimato — hay comunidad real que cambia la experiencia completa.",
  },
  {
    icon: Route,
    title: ["Itinerarios diseñados", "a mano"],
    desc: "Cada ruta evita las trampas turísticas. Visitamos lugares que el guía conoce y ama. Sin prisa, sin relleno, sin lo que ya viste en todas las fotos de Instagram.",
  },
  {
    icon: Heart,
    title: ["Conexión real con", "el destino"],
    desc: "Convivimos con familias locales, dormimos en hospedajes con alma y caminamos rutas que no salen en ninguna guía. Auténtico por diseño.",
  },
  {
    icon: Star,
    title: ["Un guía que te trata", "como amigo"],
    desc: "No es un empleado de turno. Diseñó el viaje, lo conoce de memoria y estará contigo en cada paso. Responde mensajes y conoce tus intereses antes de salir.",
  },
];

export default function About() {
  return (
    <div data-testid="about-page" className="bg-white">
      {/* HERO — colectivo de viajeros */}
      <section className="pt-28 pb-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-500 font-bold mb-4">¡Somos Infinitur!</div>
            <h1 className="font-display text-[42px] sm:text-5xl lg:text-[56px] text-text-main leading-[1.08] tracking-tight mb-6 max-w-md">
              Un colectivo de viajeros de verdad
            </h1>
            <p className="text-[15px] text-text-sec leading-relaxed max-w-md mb-4">
              Somos exploradores que buscan conocer, aprender e involucrarse con la riqueza de nuestra naturaleza,
              cultura y tradiciones. Sentimos un <span className="font-bold text-text-main">fuerte compromiso con México</span> y
              con cada persona que se suma al camino.
            </p>
            <p className="text-[15px] text-text-sec leading-relaxed max-w-md">
              Creemos que a través del viaje se puede incrementar la conciencia de nosotros mismos y de la realidad
              del país que habitamos.
            </p>

            <div className="border-t border-[#E8E6E0] mt-8 pt-6 flex gap-12">
              <Stat num="+10" label="años viajando" />
              <Stat num="+2,400" label="viajeros en el camino" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 h-[340px] sm:h-[420px]">
            <div className="rounded-xl overflow-hidden">
              <img src={COLLAGE[0]} alt="Viajeros Infinitur" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-rows-2 gap-3">
              <div className="rounded-xl overflow-hidden">
                <img src={COLLAGE[1]} alt="Grupo Infinitur en ruta" loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden">
                <img src={COLLAGE[2]} alt="Comunidad Infinitur" loading="lazy" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILOSOFÍA Y QUIÉN TE GUÍA */}
      <section className="bg-[#F5F2EC] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-soft">
              <img src={FOUNDER_PHOTO} alt="Sir Marinerus, fundador de Infinitur" loading="lazy"
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur px-5 py-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center flex-shrink-0">
                  <Star size={15} fill="currentColor" />
                </span>
                <div>
                  <div className="font-display text-[19px] text-text-main font-bold leading-tight">Sir Marinerus</div>
                  <div className="text-[12px] text-text-sec">Fundador – 10 años guiando</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="text-[11px] uppercase tracking-[0.18em] text-text-main font-bold mb-4">
              Nuestra filosofía y quién te guía
            </div>
            <h2 className="font-display text-[32px] sm:text-[38px] leading-[1.15] mb-6">
              <span className="block text-text-main">No vendemos paquetes.</span>
              <span className="block text-orange-500 italic">Compartimos caminos.</span>
            </h2>
            <p className="text-[15px] text-text-sec leading-relaxed mb-4 max-w-2xl">
              Viajar tiene un fuerte impacto dentro de nosotros — antes, durante y después somos personas diferentes.
              Cada lugar que visitamos, mezclado con el proceso interno de cada uno, genera una experiencia única e inigualable.
            </p>
            <p className="text-[15px] text-text-sec leading-relaxed mb-7 max-w-2xl">
              Detrás de cada viaje hay un coordinador que diseñó la ruta a mano, conoce cada destino porque lo ha vivido
              primero y estará contigo en cada paso del camino. No guía grupos — acompaña personas.
            </p>
            <blockquote className="bg-[#EAF5E0] border-l-4 border-green-700 rounded-r-xl px-6 py-5 max-w-3xl">
              <p className="font-display italic text-[17px] text-green-900 leading-relaxed">
                &ldquo;El viaje se compone de todos los procesos implícitos en el momento mismo de viajar — desde que el
                viajero reconoce la situación en la que se encuentra, hasta que regresa transformado.&rdquo;
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      {/* CÓMO VIAJAMOS */}
      <section className="py-16 lg:py-20">
        <div className="max-w-[1140px] mx-auto px-5 lg:px-20">
          <div className="text-center mb-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-text-sec font-bold mb-3">Cómo viajamos</div>
            <h2 className="font-display text-[32px] sm:text-[38px] text-text-main">Lo que nos hace diferentes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {DIFERENCIAS.map((d) => (
              <div key={d.title.join(" ")} className="bg-[#F5F2EC] rounded-2xl p-6">
                <div className="text-green-700 mb-4">
                  <d.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-[21px] text-text-main leading-tight mb-3">
                  {d.title[0]}<br />{d.title[1]}
                </h3>
                <p className="text-[13px] text-text-sec leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALIDADES */}
      <section className="bg-[#F5F2EC] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="mb-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-500 font-bold mb-3">Modalidades</div>
            <h2 className="font-display text-[32px] sm:text-[38px] text-text-main mb-3">¿Cómo quieres viajar?</h2>
            <p className="text-[14px] text-text-sec">
              Cada viaje tiene una modalidad pensada para un tipo de viajero. Encuentra la tuya.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRIP_TYPES.map((t) => (
              <div key={t.key}
                data-testid={`modalidad-${t.key.toLowerCase().replace(/[\s°]/g, "-")}`}
                className={`rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1 ${
                  t.key === "A la Carta"
                    ? "bg-[#FFE8D8] border-2 border-dashed border-orange-300"
                    : "bg-white border border-[#E8E6E0]"
                }`}>
                <div className={`mb-4 ${t.key === "A la Carta" ? "text-orange-500" : t.fg}`}>
                  <t.icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="font-display text-[19px] text-text-main mb-2">{t.key}</h3>
                <p className="text-[13px] text-text-sec leading-relaxed">{TRIP_TYPE_DESCRIPTIONS[t.key]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA OSCURO */}
      <section className="bg-carbon text-white py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="font-display text-[32px] sm:text-[40px] leading-tight mb-4">
            ¿Listo para conocernos en el camino?
          </h2>
          <p className="text-white/70 text-[15px] mb-8">
            Únete a una de nuestras próximas salidas o escríbenos si tienes dudas.<br />
            Respondemos en menos de 24 horas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={waLink(WA_MESSAGES.conocenos)} target="_blank" rel="noreferrer"
              data-testid="about-cta-whatsapp"
              className="btn-whatsapp inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm">
              <WhatsAppGlyph size={16} /> Contáctanos
            </a>
            <Link to="/destinos" data-testid="about-cta-destinos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/40 hover:bg-white hover:text-carbon font-semibold text-sm transition-colors">
              Ver todos los destinos <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div>
      <div className="font-display text-[34px] text-green-700 font-bold leading-none">{num}</div>
      <div className="text-[12px] text-text-sec mt-1.5">{label}</div>
    </div>
  );
}
