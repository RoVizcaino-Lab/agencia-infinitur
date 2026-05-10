import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Star, MapPin, Calendar } from "lucide-react";

export default function About() {
  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => { api.get("/testimonials").then((r) => setTestimonials(r.data)); }, []);

  return (
    <div data-testid="about-page" className="pt-32 pb-24 bg-bone">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-5">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-[#E5E0D8] sticky top-28">
            <img src="https://images.unsplash.com/photo-1591953996491-ea0d5ff3db59" alt="Diego, guía" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="md:col-span-7 space-y-8">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-4">El guía</div>
            <h1 className="font-heading text-5xl sm:text-6xl text-ink leading-tight mb-6">
              Hola, soy Diego.<br /><span className="italic font-light text-ink/70">Tu compañero de ruta.</span>
            </h1>
          </div>
          <p className="text-lg text-ink/75 leading-relaxed">
            Llevo más de 10 años explorando América y Europa, y los últimos 6 guiando grupos chicos por rincones que me enamoraron.
            Soy mexicano, biólogo de formación, y aprendí lo que sé caminando al lado de antropólogos, cocineras locales y viejos lobos de mar.
          </p>
          <p className="text-lg text-ink/75 leading-relaxed">
            En cada viaje busco un equilibrio entre los lugares icónicos que tienes que conocer una vez en la vida, y los rincones secretos que solo
            descubres cuando alguien que vive ahí te lleva de la mano. Me obsesiono con los detalles: el restaurante correcto, el horario exacto, el atajo que cambia todo.
          </p>

          <div className="grid grid-cols-3 gap-4 py-6">
            <Fact icon={MapPin} num="40+" label="destinos" />
            <Fact icon={Calendar} num="120+" label="viajes" />
            <Fact icon={Star} num="4.9" label="rating" />
          </div>

          <div>
            <h2 className="font-heading text-3xl text-ink mb-6">Lo que dicen mis viajeros</h2>
            <div className="space-y-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white border border-[#E5E0D8] rounded-2xl p-6">
                  <div className="flex gap-0.5 text-terracotta mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-ink/80 italic mb-3 leading-relaxed">"{t.text}"</p>
                  <div className="text-sm font-semibold text-ink">{t.author} <span className="text-ink/50 font-normal">· {t.location}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, num, label }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 text-center">
      <Icon className="mx-auto text-terracotta mb-2" size={20} />
      <div className="font-heading text-3xl text-ink">{num}</div>
      <div className="text-xs uppercase tracking-wider text-ink/60">{label}</div>
    </div>
  );
}
