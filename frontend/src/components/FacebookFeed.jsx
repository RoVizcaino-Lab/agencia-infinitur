import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Facebook, PlayCircle, ArrowRight } from "lucide-react";

const FB_PAGE_URL = "https://www.facebook.com/marinerus.infinitur";

export default function FacebookFeed() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get("/videos").then((r) => setVideos(r.data)).catch(() => setVideos([]));
  }, []);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-br from-orange-50 via-bone to-yellow-50">
      <div className="absolute top-20 right-10 text-9xl text-orange-200/50 font-heading select-none pointer-events-none">¡Hola!</div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center mb-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Facebook size={14} fill="white" /> En vivo desde Facebook
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight mb-5">
              Vive cada viaje en <span className="text-orange-500 italic">tiempo real</span>
            </h2>
            <p className="text-lg text-ink/75 leading-relaxed">
              Reproduce nuestros videos directamente desde aquí. Cada aventura tiene su historia: amaneceres en la montaña,
              comidas familiares, caminatas por rutas que pocos conocen.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 lg:justify-self-end">
            <a
              href={FB_PAGE_URL}
              target="_blank"
              rel="noreferrer"
              data-testid="fb-follow-btn"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1877F2] hover:bg-[#0f5fc4] text-white font-bold transition-all hover:scale-105"
            >
              <Facebook size={18} fill="white" /> Síguenos en Facebook
            </a>
            <a
              href={`${FB_PAGE_URL}/videos`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white border-2 border-orange-400 text-orange-600 font-bold hover:bg-orange-50 transition-all"
            >
              Ver todos los videos <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {videos.length === 0 ? (
          <EmptyVideos />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="videos-grid">
            {videos.map((v) => (
              <VideoCard key={v.id} url={v.fb_url} title={v.title} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VideoCard({ url, title }) {
  // Facebook Video Embed plays inline (in-page) when user clicks play.
  // Does NOT redirect to facebook.com (unlike the Page Plugin).
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560&t=0`;
  return (
    <div className="bg-white rounded-2xl border-4 border-white shadow-floating overflow-hidden hover:-translate-y-1 transition-transform duration-300">
      <div className="relative aspect-video bg-black">
        <iframe
          title={title || "Video INFINITUR"}
          src={src}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      </div>
      {title && (
        <div className="px-4 py-3">
          <div className="font-semibold text-ink text-sm line-clamp-2">{title}</div>
        </div>
      )}
    </div>
  );
}

function EmptyVideos() {
  return (
    <div className="bg-white border border-orange-200 rounded-3xl p-10 text-center max-w-2xl mx-auto">
      <PlayCircle className="mx-auto text-orange-500 mb-4" size={48} />
      <h3 className="font-heading text-2xl text-ink mb-2">Aún no hay videos publicados aquí</h3>
      <p className="text-ink/70 mb-6">
        El administrador puede agregar URLs de videos de Facebook desde el panel para que se reproduzcan directamente en esta página.
      </p>
      <a
        href={`${FB_PAGE_URL}/videos`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#0f5fc4] text-white px-6 py-3 rounded-full font-bold"
      >
        <Facebook size={16} fill="white" /> Ver videos en Facebook
      </a>
    </div>
  );
}
