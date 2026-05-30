import { Facebook, PlayCircle } from "lucide-react";

const FB_PAGE_URL = "https://www.facebook.com/marinerus.infinitur";

export default function FacebookFeed() {
  const encoded = encodeURIComponent(FB_PAGE_URL);
  const src = `https://www.facebook.com/plugins/page.php?href=${encoded}&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId`;

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-br from-orange-50 via-bone to-yellow-50">
      <div className="absolute top-20 right-10 text-9xl text-orange-200/50 font-heading select-none pointer-events-none">¡Hola!</div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Facebook size={14} fill="white" /> En vivo desde Facebook
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight mb-6">
            Vive cada viaje en <span className="text-orange-500 italic">tiempo real</span>
          </h2>
          <p className="text-lg text-ink/75 leading-relaxed mb-8">
            Sube en directo cada amanecer, cada platillo, cada caminata. Síguenos para ver los videos de los grupos que andan en ruta —
            podrías estar viendo el lugar al que vas a viajar el mes que entra.
          </p>
          <div className="space-y-3">
            {["📹 Videos cortos de cada viaje", "📸 Historias detrás de cada destino", "🗓️ Anuncios de salidas exclusivas"].map((t) => (
              <div key={t} className="flex items-center gap-3 text-ink/80">
                <PlayCircle size={18} className="text-orange-500 flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <a
            href={FB_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="fb-follow-btn"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1877F2] hover:bg-[#0f5fc4] text-white font-bold transition-all hover:scale-105"
          >
            <Facebook size={18} fill="white" /> Síguenos en Facebook
          </a>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-orange-400 to-yellow-400 rounded-[2rem] rotate-2 opacity-30 blur-2xl" />
          <div className="relative bg-white rounded-[1.75rem] border-4 border-white shadow-floating overflow-hidden">
            <div className="bg-gradient-to-r from-[#1877F2] to-[#0f5fc4] px-5 py-3 flex items-center gap-2 text-white text-sm font-semibold">
              <Facebook size={16} fill="white" /> @infinitur.mx
            </div>
            <iframe
              title="Facebook feed"
              src={src}
              width="100%"
              height="560"
              style={{ border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white font-heading text-2xl px-5 py-2 rounded-full rotate-6 shadow-floating">
            ¡En vivo!
          </div>
        </div>
      </div>
    </section>
  );
}
