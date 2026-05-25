import { useEffect, useState } from "react";
import api, { resolveImage } from "@/lib/api";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  useEffect(() => { api.get("/gallery").then((r) => setPhotos(r.data)); }, []);

  return (
    <div data-testid="gallery-page" className="pt-32 pb-24 bg-bone min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-xs uppercase tracking-[0.25em] text-orange-600 mb-4">Galería</div>
        <h1 className="font-heading text-5xl sm:text-6xl text-ink mb-6">Postales del camino</h1>
        <p className="text-ink/70 text-lg max-w-2xl mb-14">
          Cada fotografía es un recuerdo de un grupo, una risa, un amanecer compartido. Estas son nuestras memorias favoritas.
        </p>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {photos.map((p) => (
            <div key={p.id} className="break-inside-avoid mb-5 rounded-2xl overflow-hidden bg-white border border-[#E5E0D8] group">
              <img src={resolveImage(p.url)} alt={p.caption} loading="lazy" className="w-full h-auto block group-hover:scale-105 transition-transform duration-700" />
              {(p.caption || p.location) && (
                <div className="p-4">
                  {p.caption && <div className="font-semibold text-ink text-sm">{p.caption}</div>}
                  {p.location && <div className="text-xs text-ink/60">{p.location}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
