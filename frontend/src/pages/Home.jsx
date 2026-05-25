import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import TripCard from "@/components/TripCard";
import MonthCarousel from "@/components/MonthCarousel";
import FacebookFeed from "@/components/FacebookFeed";
import { ArrowRight, Compass, Heart, Users, Star, Sparkles } from "lucide-react";

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get("/trips?featured=true").then((r) => setTrips(r.data));
    api.get("/gallery").then((r) => setPhotos(r.data.slice(0, 6)));
    api.get("/testimonials").then((r) => setTestimonials(r.data));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[100vh] min-h-[640px] w-full overflow-hidden">
        <img
          src="https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg"
          alt="Atardecer en la montaña"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-end pb-24">
          <div className="max-w-3xl fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs uppercase tracking-[0.2em] mb-6 font-bold shadow-lg">
              <Sparkles size={14} /> Grupos chicos · Aventuras grandes
            </div>
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-white leading-[0.9] tracking-tight mb-6">
              ¡El Viaje<br /><span className="text-orange-400">de los Viajes!</span>
            </h1>
            <p className="text-white/85 text-lg max-w-xl leading-relaxed mb-8">
              Aventuras guiadas para grupos de 10 a 15 personas por México, América y Europa.
              Itinerarios cuidados, experiencias auténticas, y un guía que te trata como amigo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/viajes" data-testid="hero-cta-trips" className="btn-terracotta inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold">
                Ver próximos viajes <ArrowRight size={16} />
              </Link>
              <Link to="/sobre-mi" data-testid="hero-cta-about" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white border border-white/40 hover:bg-white hover:text-ink transition-all">
                Conoce al guía
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MONTH CAROUSEL */}
      <MonthCarousel />

      {/* INTRO */}
      <section className="py-24 sm:py-32 bg-bone">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-6">
            <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-4">Por qué Senderos</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">
              No vendemos paquetes.<br /><span className="italic">Compartimos caminos.</span>
            </h2>
          </div>
          <p className="md:col-span-6 text-lg text-ink/70 leading-relaxed">
            Cada viaje está diseñado a mano. Visitamos lugares que nos enamoraron, dormimos en hospedajes con alma,
            y conocemos personas que enriquecen el camino. Si buscas tours masivos, no somos lo que buscas. Si buscas conexión, bienvenido.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Grupos chicos", text: "Solo 10 a 15 viajeros por salida. Conoces a todos por nombre." },
            { icon: Compass, title: "Itinerarios curados", text: "Cada parada tiene sentido. Sin tiempos muertos ni trampas turísticas." },
            { icon: Heart, title: "Conexión real", text: "Comemos con familias locales y caminamos rutas que recordarás siempre." },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-[#E5E0D8] rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-5">
                <f.icon size={22} />
              </div>
              <h3 className="font-heading text-2xl text-ink mb-2">{f.title}</h3>
              <p className="text-ink/70 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED TRIPS */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-3">Próximas salidas</div>
              <h2 className="font-heading text-4xl sm:text-5xl text-ink">Viajes destacados</h2>
            </div>
            <Link to="/viajes" data-testid="see-all-trips" className="text-terracotta font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      {photos.length > 0 && (
        <section className="py-24 bg-sand">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-3">Memorias</div>
                <h2 className="font-heading text-4xl sm:text-5xl text-ink">Momentos en el camino</h2>
              </div>
              <Link to="/galeria" className="text-terracotta font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Ver galería <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.slice(0, 6).map((p, i) => (
                <div key={p.id} className={`relative overflow-hidden rounded-2xl ${i === 0 ? "md:row-span-2 aspect-square md:aspect-auto" : "aspect-[4/3]"}`}>
                  <img src={p.url} alt={p.caption} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FACEBOOK FEED */}
      <FacebookFeed />

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-3 text-center">Voces del camino</div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink text-center mb-16">Lo que dicen quienes ya viajaron</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-white border border-[#E5E0D8] rounded-3xl p-8">
                  <div className="flex gap-0.5 text-terracotta mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key -- stars are presentational, no reorder/filter
                      <Star key={`star-${t.id}-${i}`} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-ink/80 italic leading-relaxed mb-6">"{t.text}"</p>
                  <div className="text-sm">
                    <div className="font-semibold text-ink">{t.author}</div>
                    <div className="text-ink/60">{t.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-ink text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-4xl sm:text-5xl mb-6">¿Listo para tu próximo viaje?</h2>
          <p className="text-white/75 text-lg mb-8">
            Cuéntanos a dónde sueñas ir o súmate a una de nuestras próximas salidas. Te respondemos en menos de 24 horas.
          </p>
          <Link to="/contacto" data-testid="footer-cta-contact" className="btn-terracotta inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold">
            Reservar mi lugar <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
