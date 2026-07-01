import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import {
  Quote, Sparkles, Compass, Heart, MapPin, Calendar, Users,
  MessageCircle, ArrowRight, Star,
} from "lucide-react";
import { TRIP_TYPES, TRIP_TYPE_DESCRIPTIONS } from "@/lib/tripStyle";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const PILLARS = [
  {
    icon: Users,
    title: "Grupos chicos",
    desc: "Sólo 10 a 15 viajeros por salida. Te conocemos por tu nombre y nadie se pierde en la multitud.",
  },
  {
    icon: Compass,
    title: "Coordinador presente",
    desc: "Tu guía viaja contigo del primer al último día. Se anticipa, resuelve y arma plan B si hace falta.",
  },
  {
    icon: MapPin,
    title: "Rutas conocidas",
    desc: "Cada itinerario lo caminamos primero. Hospedajes, restaurantes y experiencias probadas en persona.",
  },
  {
    icon: Heart,
    title: "Comunidad",
    desc: "Más que un viaje, una familia que se forma. Muchos viajeros regresan año tras año.",
  },
];

export default function About() {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => { api.get("/testimonials").then((r) => setTestimonials(r.data)); }, []);

  return (
    <div data-testid="about-page" className="bg-bone">
      {/* HERO */}
      <section className="pt-32 pb-16 sm:pb-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-4">Conócenos</div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text-main leading-[1.05] tracking-tight mb-6">
              Somos <span className="text-orange-500">INFINITUR</span>.
              <br />
              <em className="italic font-light text-text-sec">El viaje de los viajes.</em>
            </h1>
            <p className="text-lg sm:text-xl text-text-sec leading-relaxed max-w-2xl mb-8">
              Una agencia de viajes mexicana, hecha a la medida y operada por una guía con corazón viajero.
              Organizamos expediciones en grupos chicos por México, América y Europa.
            </p>
            <div className="flex flex-wrap gap-5">
              <Stat num="+10" label="años viajando" />
              <Stat num="+2,400" label="viajeros" />
              <Stat num="+40" label="destinos" />
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="grid grid-cols-3 grid-rows-3 gap-3 h-[420px]">
              <div className="col-span-2 row-span-2 rounded-3xl bg-[#D6EDCA] flex items-center justify-center">
                <Compass className="text-green-800" size={86} strokeWidth={1.2} />
              </div>
              <div className="rounded-3xl bg-[#FFE0C8] flex items-center justify-center">
                <Heart className="text-orange-700" size={42} strokeWidth={1.5} />
              </div>
              <div className="rounded-3xl bg-[#F0F7EA] flex items-center justify-center">
                <Sparkles className="text-green-700" size={42} strokeWidth={1.5} />
              </div>
              <div className="col-span-3 rounded-3xl bg-[#1B1B1A] text-white flex items-center justify-center px-5">
                <div className="font-display text-xl italic">&ldquo;El viaje de los viajes&rdquo;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILOSOFÍA + EL GUÍA */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#FFE0C8] via-[#F0F7EA] to-[#D6EDCA] flex items-end justify-center overflow-hidden">
              <img
                src="https://customer-assets.emergentagent.com/job_grupos-expedicion/artifacts/4rw8xqhn_Infinitur%20Im%C3%A1genes_Con%C3%B3cenos_1.jpg"
                alt="Coordinador Infinitur"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 pointer-events-none" />
              <div className="relative w-full bg-white/95 backdrop-blur px-6 py-5 m-4 rounded-2xl shadow-soft">
                <div className="text-[10px] uppercase tracking-[0.25em] text-orange-500 font-bold mb-1">Coordinador Infinitur</div>
                <div className="font-display text-2xl text-text-main">Marinerus</div>
                <div className="text-sm text-text-sec">CDMX · Guía con más de 10 años en ruta</div>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 space-y-6">
            <div className="text-xs uppercase tracking-[0.25em] text-green-700 font-bold">Filosofía + el guía</div>
            <h2 className="font-display text-4xl sm:text-5xl text-text-main leading-tight">
              Viajar es <em className="italic text-green-700 font-display">conectar</em>
            </h2>
            <p className="text-lg text-text-sec leading-relaxed">
              Creemos en el viaje lento, en los grupos chicos y en las conversaciones largas. Cada itinerario nace de
              haber caminado el lugar primero: probamos los restaurantes, dormimos en los hospedajes y conocimos a las
              familias locales.
            </p>
            <div className="relative bg-[#F0F7EA] rounded-2xl p-6 pl-12">
              <Quote className="absolute top-5 left-5 text-green-700" size={20} />
              <p className="italic text-text-main">
                &ldquo;Queremos que cada viajero regrese con amigos nuevos y con historias que pueda contar por años.&rdquo;
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Grupos chicos", "Hospedajes con alma", "Comida local", "Itinerarios probados", "Coordinador siempre presente"].map((c) => (
                <span key={c} className="bg-white border border-[#E8E6E0] text-text-main text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO VIAJAMOS — 4 pilares */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-3">Cómo viajamos</div>
            <h2 className="font-display text-4xl sm:text-5xl text-text-main leading-tight">
              Cuatro pilares que nos hacen <em className="italic text-green-700 font-display">diferentes</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-white border border-[#E8E6E0] rounded-3xl p-7 hover:-translate-y-1 hover:shadow-floating transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#F0F7EA] text-green-700 flex items-center justify-center mb-5">
                  <p.icon size={22} />
                </div>
                <h3 className="font-display text-2xl text-text-main mb-2">{p.title}</h3>
                <p className="text-text-sec leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALIDADES — 7 tipos + A la carta */}
      <section className="py-20 bg-[#F5F2EC]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="mb-14 max-w-3xl">
            <div className="text-xs uppercase tracking-[0.25em] text-green-700 font-bold mb-3">Modalidades</div>
            <h2 className="font-display text-4xl sm:text-5xl text-text-main leading-tight">
              Aventuras pensadas para <em className="italic text-orange-500 font-display">distintos viajeros</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRIP_TYPES.map((t) => (
              <div key={t.key} className={`${t.bg} rounded-3xl p-6 transition-all hover:-translate-y-1`}>
                <div className={`w-12 h-12 rounded-xl bg-white/70 ${t.fg} flex items-center justify-center mb-4`}>
                  <t.icon size={22} />
                </div>
                <h3 className={`font-display text-xl ${t.fg} mb-2`}>{t.key}</h3>
                <p className="text-text-main/80 text-sm leading-relaxed">{TRIP_TYPE_DESCRIPTIONS[t.key]}</p>
              </div>
            ))}
            <div className="bg-[#1B1B1A] text-white rounded-3xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4">
                <Sparkles size={22} />
              </div>
              <h3 className="font-display text-xl mb-2">A la carta</h3>
              <p className="text-white/75 text-sm leading-relaxed flex-1">
                Si tu grupo de amigos, familia o empresa quiere un viaje exclusivo, lo armamos a tu medida.
              </p>
              <a href={waLink(WA_MESSAGES.aLaCarta)} target="_blank" rel="noreferrer"
                data-testid="a-la-carta-cta-about"
                className="mt-4 btn-whatsapp inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold">
                <MessageCircle size={14} fill="white" /> Cuéntanos tu idea
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      {testimonials.length > 0 && (
        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <div className="text-xs uppercase tracking-[0.25em] text-orange-500 font-bold mb-3">Voces del camino</div>
              <h2 className="font-display text-4xl sm:text-5xl text-text-main">Lo que dicen quienes ya viajaron</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-white border border-[#E8E6E0] rounded-3xl p-7">
                  <div className="flex gap-0.5 text-orange-500 mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={`star-${t.id}-${i}`} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-text-main/85 italic leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="text-sm font-semibold text-text-main">
                    {t.author} <span className="text-text-sec font-normal">· {t.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="py-20 bg-[#1B1B1A] text-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-20 text-center">
          <h2 className="font-display text-4xl sm:text-5xl mb-4">
            ¿Listo para tu próximo <em className="italic text-green-300 font-display">viaje</em>?
          </h2>
          <p className="text-white/75 max-w-2xl mx-auto mb-8">
            Tenemos calendario abierto. Mira los próximos destinos o escríbenos para resolver dudas.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/destinos" data-testid="about-cta-destinos"
              className="btn-orange inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold">
              Ver próximos viajes <ArrowRight size={16} />
            </Link>
            <a href={waLink(WA_MESSAGES.conocenos)} target="_blank" rel="noreferrer"
              data-testid="about-cta-whatsapp"
              className="btn-whatsapp inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold">
              <MessageCircle size={16} fill="white" /> Contáctanos
            </a>
          </div>
        </div>
      </section>

      <Calendar className="hidden" />
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div>
      <div className="font-display text-4xl text-text-main font-bold leading-none">{num}</div>
      <div className="text-xs uppercase tracking-wider text-text-sec mt-1">{label}</div>
    </div>
  );
}
