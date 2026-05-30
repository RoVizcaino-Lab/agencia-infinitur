import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Star, MapPin, Calendar, Compass, Heart, Sparkles, Users, Mountain, Globe2 } from "lucide-react";

export default function About() {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => { api.get("/testimonials").then((r) => setTestimonials(r.data)); }, []);

  return (
    <div data-testid="about-page" className="bg-bone">
      {/* HERO */}
      <section className="relative pt-32 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-jade/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Quiénes somos
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-ink leading-[0.95] tracking-tight">
              Somos <span className="text-orange-500">INFINITUR</span>.<br />
              <span className="italic font-light text-ink/70">Tu agencia para el viaje de los viajes.</span>
            </h1>
            <p className="text-lg text-ink/75 leading-relaxed max-w-2xl">
              Una agencia de viajes mexicana, hecha a la medida y operada por una guía con corazón viajero.
              Organizamos expediciones en grupos chicos (10 a 15 personas) por México, América y Europa, con
              itinerarios pensados a detalle, hospedajes con alma y experiencias que no encuentras en un folleto.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-tr from-orange-400 via-orange-300 to-jade/40 rounded-[2rem] rotate-3 opacity-30 blur-xl" />
              <div className="relative bg-white rounded-[1.75rem] border-4 border-white shadow-floating p-6 sm:p-10">
                <img src="/infinitur-logo.png" alt="INFINITUR logo" className="w-full h-auto object-contain" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-heading text-lg px-5 py-1.5 rounded-full rotate-[-3deg] shadow-floating whitespace-nowrap">
                ¡El Viaje de los Viajes!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILOSOFÍA / OBJETIVO */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
              <Heart size={26} />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-orange-600 mb-3">Nuestra filosofía</div>
            <h2 className="font-heading text-3xl sm:text-4xl text-ink mb-5">Viajar es conectar</h2>
            <p className="text-ink/75 leading-relaxed">
              Creemos en el viaje lento, en los grupos chicos y en las conversaciones largas. Cada itinerario nace de
              haber caminado el lugar primero: probamos los restaurantes, dormimos en los hospedajes y conocimos a las
              familias locales. Buscamos que cada viajero regrese con amigos nuevos y con historias que pueda contar
              por años.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-8 sm:p-10 shadow-floating">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
              <Compass size={26} />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-white/80 mb-3">Nuestro objetivo</div>
            <h2 className="font-heading text-3xl sm:text-4xl mb-5">Cambiar la forma en la que viajas</h2>
            <p className="text-white/90 leading-relaxed">
              No vendemos paquetes en masa. Acompañamos a personas curiosas a descubrir lugares con profundidad y
              calidez. Nuestro objetivo es que cada salida de INFINITUR sea recordada como un parteaguas: el viaje del que
              hablas durante años. El que te hizo ver al mundo distinto.
            </p>
          </div>
        </div>
      </section>

      {/* LOGOTIPO */}
      <section className="py-20 bg-sand">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E0D8] shadow-soft">
              <img src="/infinitur-logo.png" alt="Logo INFINITUR" className="w-full h-auto object-contain" />
            </div>
          </div>
          <div className="md:col-span-7 space-y-5">
            <div className="text-xs uppercase tracking-[0.25em] text-jade mb-1">El logotipo</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Una serpiente sagrada, un viaje infinito</h2>
            <p className="text-lg text-ink/75 leading-relaxed">
              Nuestro emblema es <strong>Quetzalcóatl</strong>, la serpiente emplumada de la cosmología mesoamericana —
              símbolo de unión entre tierra y cielo, viento que mueve, sabiduría que viaja. La forma circular evoca
              al infinito: el ciclo de partir, descubrir y regresar transformado.
            </p>
            <p className="text-lg text-ink/75 leading-relaxed">
              El nombre nace de la unión de <em>infinito</em> y <em>tour</em>: viajes con raíces mexicanas, abiertos al mundo, sin
              final. Cada destino es un nuevo capítulo. Cada grupo, una nueva familia.
            </p>
          </div>
        </div>
      </section>

      {/* TRAYECTORIA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-[0.25em] text-orange-600 mb-3">Nuestra trayectoria</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink">Más de una década andando rutas</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Fact icon={Calendar} num="10+" label="años de experiencia" />
            <Fact icon={MapPin} num="40+" label="destinos visitados" />
            <Fact icon={Users} num="120+" label="grupos guiados" />
            <Fact icon={Star} num="4.9" label="rating promedio" />
          </div>

          <div className="mt-14 max-w-3xl mx-auto space-y-6 text-ink/75 leading-relaxed text-lg">
            <p>
              INFINITUR nació en la Ciudad de México de la mano de <strong>Marinerus</strong>, después de años de viajar
              por cuenta propia con amigos y descubrir que la mejor forma de conocer un lugar era ir con quien lo conoce
              bien. Lo que empezó como salidas con conocidos fue creciendo: cada vez más personas querían sumarse al
              siguiente viaje.
            </p>
            <p>
              Desde entonces hemos llevado grupos a Yucatán, Oaxaca, Chiapas, Perú, Colombia, Argentina, Francia, Italia y
              muchos otros rincones. Trabajamos con guías locales certificados, hospedajes boutique y cocineras tradicionales
              que se han vuelto parte de la familia.
            </p>
            <p>
              Cada año diseñamos un nuevo calendario de salidas: algunos viajes ya son clásicos —Machu Picchu, Chichén Itzá,
              Toscana— y otros son experimentos que estrenamos contigo.
            </p>
          </div>
        </div>
      </section>

      {/* TIPOS DE VIAJES */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.25em] text-jade mb-3">Qué tipo de viajes hacemos</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">
              Aventuras pensadas para distintos viajeros
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TRIP_TYPES.map((t) => (
              <div key={t.title} className="bg-white border border-[#E5E0D8] rounded-3xl p-7 hover:-translate-y-1 hover:shadow-floating transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${t.bg} ${t.fg} flex items-center justify-center mb-5`}>
                  <t.icon size={22} />
                </div>
                <h3 className="font-heading text-2xl text-ink mb-2">{t.title}</h3>
                <p className="text-ink/70 leading-relaxed">{t.desc}</p>
                <div className="mt-4 text-xs uppercase tracking-widest text-orange-600 font-bold">{t.duration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {testimonials.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs uppercase tracking-[0.25em] text-orange-600 mb-3">Voces del camino</div>
              <h2 className="font-heading text-4xl sm:text-5xl text-ink">Lo que dicen quienes ya viajaron</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-white border border-[#E5E0D8] rounded-3xl p-7">
                  <div className="flex gap-0.5 text-terracotta mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key -- presentational stars
                      <Star key={`star-${t.id}-${i}`} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-ink/80 italic leading-relaxed mb-4">"{t.text}"</p>
                  <div className="text-sm font-semibold text-ink">{t.author} <span className="text-ink/50 font-normal">· {t.location}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

const TRIP_TYPES = [
  {
    icon: Mountain,
    bg: "bg-orange-100",
    fg: "text-orange-600",
    title: "Escapadas de fin de semana",
    desc: "Pueblos mágicos, cerros sagrados, temazcales y mercados. Perfectas para desconectarte sin pedir vacaciones largas.",
    duration: "1 a 3 días",
  },
  {
    icon: Compass,
    bg: "bg-jade/10",
    fg: "text-jade",
    title: "Expediciones por México",
    desc: "Yucatán, Oaxaca, Chiapas, Baja California. Viajes profundos por la riqueza cultural y natural de nuestro país.",
    duration: "3 a 5 días",
  },
  {
    icon: Globe2,
    bg: "bg-yellow-100",
    fg: "text-yellow-700",
    title: "Viajes internacionales",
    desc: "Perú, Colombia, Argentina, Italia, Francia. Aventuras de varios días con guía local y experiencias auténticas.",
    duration: "5 días a 2 semanas",
  },
];

function Fact({ icon: Icon, num, label }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 text-center">
      <Icon className="mx-auto text-orange-500 mb-2" size={22} />
      <div className="font-heading text-4xl text-ink">{num}</div>
      <div className="text-xs uppercase tracking-wider text-ink/60 mt-1">{label}</div>
    </div>
  );
}
