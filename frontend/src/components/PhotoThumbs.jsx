import { useState } from "react";
import { Expand } from "lucide-react";
import { resolveImage } from "@/lib/api";
import PhotoLightbox from "@/components/PhotoLightbox";

/**
 * Small same-size thumbnails; clicking one opens the full-size viewer (carousel when
 * there are several). Used by itinerary stops and "Lugares a visitar".
 *  - gridClassName: column layout of the thumbnails
 *  - testId: data-testid of each thumbnail
 */
export default function PhotoThumbs({ images, alt, gridClassName = "grid-cols-2 sm:grid-cols-3", testId = "stop-photo" }) {
  const [openAt, setOpenAt] = useState(null);
  const list = (images || []).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <>
      <div className={`mt-3 grid gap-2 ${gridClassName}`}>
        {list.map((src, k) => (
          <button key={k} type="button" onClick={() => setOpenAt(k)} data-testid={testId}
            aria-label={`Ver foto ${k + 1} de ${list.length}${alt ? `: ${alt}` : ""}`}
            className="group relative block w-full aspect-[4/3] overflow-hidden rounded-xl bg-[#EFEAE1] cursor-zoom-in
              focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600">
            <img src={resolveImage(src)} alt={alt} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 text-text-main flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand size={14} />
            </span>
          </button>
        ))}
      </div>
      {openAt !== null && (
        <PhotoLightbox images={list} startIndex={openAt} title={alt}
          open onOpenChange={(o) => !o && setOpenAt(null)} />
      )}
    </>
  );
}
