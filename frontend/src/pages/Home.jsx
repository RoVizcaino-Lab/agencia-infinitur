import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, MessageCircle } from "lucide-react";
import api, { resolveImage } from "@/lib/api";
import MonthCarousel from "@/components/MonthCarousel";
import { waLink, WA_MESSAGES, WA_DISPLAY } from "@/lib/whatsapp";

const fmtMoney = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
const fmtRange = (s, e) => {
  if (!s) return "";
  const a = new Date(s); const b = e ? new Date(e) : a;
  const opts = { day: "numeric", month: "short", year: "numeric" };
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} al ${b.getDate()} de ${a.toLocaleDateString("es-MX", { month: "long" })}, ${a.getFullYear()}`;
  }
  return `${a.toLocaleDateString("es-MX", opts)} – ${b.toLocaleDateString("es-MX", opts)}`;
};

const HERO_PHOTOS = [
  "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg?w=900",
  "https://images.unsplash.com/photo-1606403759369-e10299ed5740?w=900&q=80",
  "https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg?w=900",
];

const MANIFIESTO_GRID = [
  "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg?w=800",
  "https://images.unsplash.com/photo-1606403759369-e10299ed5740?w=800",
  "https://images.unsplash.com/photo-1521437687640-34c398f4e598?w=800",
  "https://images.unsplash.com/photo-1629752123286-49a7f60571f3?w=800",
];

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get("/trips?featured=true").then((r) => setDestacados(r.data.slice(0, 4)));
    api.get("/videos").then((r) => setVideos(r.data.slice(0, 3))).catch(() => setVideos([]));
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="bg-bone pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-stretch">
          <div className="fade-in flex flex-col justify-center">
            <div className="text-orange-500 font-bold uppercase tracking-[0.2em] text-sm mb-5">¡SOMOS INFINITUR!</div>
            <h1 className="font-display text-5xl xl:text-6xl text-text-main leading-[0.95] tracking-tight mb-5">
              ¡El viaje<br />de los viajes!
            </h1>
            <p className="text-text-sec text-lg leading-relaxed max-w-md mb-7">
              Te llevamos a conocer México y el mundo viviendo una experiencia única.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/destinos" data-testid="hero-cta-destinos" className="btn-orange inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
                Ver próximos destinos
              </Link>
              <Link to="/conocenos" data-testid="hero-cta-conocenos" className="btn-secondary-ghost inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm">
                Conócenos <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          {HERO_PHOTOS.map((src) => (
            <div key={src} className="rounded-2xl overflow-hidden shadow-floating min-h-[420px] lg:min-h-full">
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* PRÓXIMOS DESTINOS */}
      <section className="bg-bone py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <h2 className="font-display text-4xl sm:text-5xl text-text-main mb-2">Próximos destinos</h2>
          <div className="flex items-center gap-2 text-sm text-text-sec mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Salidas desde CDMX
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destacados.map((t) => <DestinoCard key={t.id} trip={t} />)}
          </div>
          <div className="flex justify-center mt-10">
            <Link to="/destinos" data-testid="ver-todos-destinos" className="btn-orange-outline inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold">
              Ver todos los destinos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CALENDARIO DE AVENTURAS */}
      <MonthCarousel />
      <div className="bg-white pb-12 -mt-8">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 flex justify-center">
          <Link to="/destinos" className="btn-orange-outline inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold">
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* CÓMO VIAJAMOS */}
      <section className="bg-white py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20">
          <div className="text-center">
            <div className="text-base uppercase tracking-[0.25em] text-green-700 font-bold mb-3">CÓMO VIAJAMOS</div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text-main leading-tight whitespace-normal sm:whitespace-nowrap">
              No vendemos paquetes. <span className="text-orange-500">Compartimos caminos.</span>
            </h2>
            <p className="text-text-sec text-lg max-w-4xl mx-auto mt-5 leading-relaxed">
              Cada viaje está diseñado a mano. Visitamos lugares que nos enamoraron, dormimos en hospedajes con alma,
              y conocemos personas que enriquecen el camino. Si buscas conexión, bienvenido/a.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 mt-8">
              {["GRUPOS PEQUEÑOS", "ITINERARIOS CUIDADOS", "UN GUÍA COMO AMIGO", "CONEXIÓN REAL"].map((p) => (
                <span key={p} className="px-4 py-1.5 rounded-full border border-green-300 bg-green-100 text-green-700 text-xs font-bold tracking-widest">{p}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-12">
            {MANIFIESTO_GRID.map((src, i) => (
              <div key={src + i} className="h-[420px] overflow-hidden">
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link to="/conocenos" data-testid="como-viajamos-conocenos" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 border-green-700 text-green-700 bg-white hover:bg-green-50 transition-all">
              Conócenos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VIVE CADA VIAJE EN TIEMPO REAL */}
      <section className="bg-bone py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-text-main">
            Vive cada viaje en <span className="italic text-green-700">tiempo real</span>
          </h2>
          <p className="text-text-sec text-lg max-w-3xl mx-auto mt-4">
            Mira los reels de nuestros grupos en ruta — podrías estar viendo el lugar al que vas a viajar el próximo mes.
          </p>

          {videos.length === 0 ? (
            <div className="mt-10 max-w-2xl mx-auto bg-white border border-[#E8E6E0] rounded-3xl p-10 text-center">
              <p className="text-text-sec">El administrador puede agregar URLs de videos de Facebook desde el panel para reproducirlos aquí.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
              {videos.map((v) => (
                <div key={v.id} className="bg-black aspect-[9/16] rounded-2xl overflow-hidden shadow-floating">
                  <iframe
                    title={v.title || "Reel INFINITUR"}
                    src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(v.fb_url)}&show_text=false&width=400&t=0`}
                    className="w-full h-full"
                    style={{ border: "none" }}
                    scrolling="no"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-12">
            <p className="font-display text-2xl text-text-main">¿Te gustó lo que viste?</p>
            <p className="text-text-sec mt-1">Síguenos en nuestras redes para no perderte ninguna salida.</p>
            <div className="flex justify-center gap-4 mt-5">
              <SocialBtn href="https://instagram.com/marinerus.infinitur" bg="bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400" label="Instagram" />
              <SocialBtn href="https://www.facebook.com/marinerus.infinitur" bg="bg-[#1877F2]" label="Facebook" />
              <SocialBtn href="https://www.tiktok.com/@marinerus.infinitur" bg="bg-black" label="TikTok" />
              <SocialBtn href="https://youtube.com/@marinerus.infinitur" bg="bg-[#FF0000]" label="YouTube" />
            </div>
          </div>
        </div>
      </section>

      {/* BANNER WHATSAPP */}
      <section className="bg-carbon text-white py-14">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl text-white">
              ¿Tienes alguna duda?<br />
              <span className="text-whatsapp italic">¡Escríbenos!</span>
            </h2>
            <p className="text-white/70 mt-4 max-w-md">
              Estamos en WhatsApp para resolver cualquier pregunta — desde cómo funciona Infinitur hasta los detalles de tu próximo viaje.
              <span className="font-bold"> Sin formularios, sin esperas.</span>
            </p>
          </div>
          <div className="md:text-right">
            <a href={waLink(WA_MESSAGES.homeBanner)} target="_blank" rel="noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base mb-3">
              <MessageCircle size={18} fill="white" /> Contáctanos
            </a>
            <div className="font-display text-3xl text-whatsapp font-bold tracking-wide">{WA_DISPLAY}</div>
            <div className="text-xs text-white/60 mt-1">Lunes a domingo · Respondemos en menos de 24 hrs</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DestinoCard({ trip }) {
  return (
    <Link to={`/destinos/${trip.id}`} data-testid={`destino-card-${trip.id}`}
      className="block bg-white border border-[#E8E6E0] rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-floating transition-all duration-300">
      <div className="aspect-[3/2] overflow-hidden">
        <img src={resolveImage(trip.cover_image)} alt={trip.title} loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="p-5">
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="tag-orange px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Infinitur 90°
          </span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            trip.country === "México" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            {trip.country === "México" ? "Nacional" : "Internacional"}
          </span>
        </div>
        <h3 className="font-display text-2xl text-text-main leading-tight">{trip.title}</h3>
        <div className="text-xs text-text-sec flex items-center gap-1 mt-1.5">
          <Calendar size={11} /> {fmtRange(trip.start_date, trip.end_date)}
        </div>
        <div className="text-sm text-text-sec mt-3 line-clamp-2">
          <span className="font-semibold text-text-main">Lugares:</span> {trip.destination}
        </div>
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-[#E8E6E0]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-text-sec">desde</div>
            <div className="font-display text-2xl text-green-700 font-bold">{fmtMoney(trip.price)}<span className="text-xs text-text-sec ml-1">MXN</span></div>
          </div>
          <span className="btn-orange-outline inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold">
            Ver más <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function SocialBtn({ href, bg, label }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}
      className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center text-white shadow-floating hover:scale-110 transition-transform`}>
      <span className="font-bold text-sm">{label[0]}</span>
    </a>
  );
}
