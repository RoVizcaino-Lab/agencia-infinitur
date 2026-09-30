import { lazy, Suspense, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Expand } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { resolveImage } from "@/lib/api";
import { hasCoords } from "@/lib/geo";
import PhotoLightbox from "@/components/PhotoLightbox";

// Leaflet is only downloaded for trips that actually have coordinates
const ItineraryMap = lazy(() => import("@/components/ItineraryMap"));

/**
 * Day-by-day itinerary: one tab per day, numbered stops with photos,
 * optional footnote and previous/next day buttons.
 * Day and stop numbers come from their position in the list.
 */
export default function TripItinerary({ days }) {
  const [active, setActive] = useState("0");
  const topRef = useRef(null);
  const go = (i) => {
    setActive(String(i));
    // After prev/next from the bottom of a long day, bring the tabs back into view
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Map shows only the active day's stops; hidden when none of them has coordinates
  const dayStops = days[Number(active)]?.stops || [];
  const showMap = dayStops.some(hasCoords);

  return (
    <Tabs ref={topRef} value={active} onValueChange={setActive} data-testid="trip-itinerary-days" className="scroll-mt-28">
      {showMap && (
        <div className="mb-5">
          <Suspense fallback={<div className="h-[260px] sm:h-[340px] rounded-2xl bg-[#EFEAE1]" />}>
            <ItineraryMap stops={dayStops} />
          </Suspense>
        </div>
      )}
      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <TabsList className="h-auto bg-transparent p-0 gap-2 justify-start">
          {days.map((_, i) => (
            <TabsTrigger
              key={i}
              value={String(i)}
              data-testid={`itinerary-tab-${i}`}
              className="rounded-full px-4 py-2 text-[13px] font-semibold border border-[#E8E6E0] bg-white text-text-sec shadow-none
                hover:border-green-300 hover:text-green-700
                data-[state=active]:bg-green-700 data-[state=active]:border-green-700 data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              Día {i + 1}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {days.map((day, i) => (
        <TabsContent key={i} value={String(i)} className="mt-5" data-testid={`itinerary-day-${i}`}>
          <div className="bg-white border border-[#E8E6E0] rounded-2xl p-5 sm:p-6">
            <h3 className="font-display text-[24px] text-text-main leading-tight">
              Día {i + 1}{day.title ? `: ${day.title}` : ""}
            </h3>
            {day.description && (
              <p className="text-text-sec text-[15px] leading-relaxed mt-3 whitespace-pre-line">{day.description}</p>
            )}

            {day.stops?.length > 0 && (
              <ol className="mt-6 space-y-6">
                {day.stops.map((stop, j) => (
                  <li key={j} className="flex gap-4" data-testid={`itinerary-stop-${i}-${j}`}>
                    <div className="flex flex-col items-center">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0F7EA] text-green-700 font-bold text-sm flex items-center justify-center">
                        {j + 1}
                      </span>
                      {j < day.stops.length - 1 && <span className="flex-1 w-px bg-[#E3DFD6] mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="font-display text-[19px] text-text-main leading-snug pt-0.5">{stop.title}</div>
                      {stop.description && (
                        <p className="text-[14px] text-text-sec leading-relaxed mt-1.5 whitespace-pre-line">{stop.description}</p>
                      )}
                      <StopImages images={(stop.images || []).filter(Boolean)} alt={stop.title} />
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {day.note && (
              <p className="mt-6 pt-4 border-t border-[#EFEAE1] flex gap-2 text-[12px] text-text-sec/80 leading-relaxed">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                {day.note}
              </p>
            )}
          </div>

          {days.length > 1 && (
            <div className="flex justify-between gap-3 mt-4">
              <DayButton onClick={() => go(i - 1)} disabled={i === 0} testId="itinerary-prev">
                <ChevronLeft size={16} /> Día anterior
              </DayButton>
              <DayButton onClick={() => go(i + 1)} disabled={i === days.length - 1} testId="itinerary-next">
                Día siguiente <ChevronRight size={16} />
              </DayButton>
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Same small thumbnail size for every stop, even with a single photo; click opens the viewer.
function StopImages({ images, alt }) {
  const [openAt, setOpenAt] = useState(null);
  if (images.length === 0) return null;
  return (
    <>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((src, k) => (
          <button key={k} type="button" onClick={() => setOpenAt(k)} data-testid="stop-photo"
            aria-label={`Ver foto ${k + 1} de ${images.length}${alt ? `: ${alt}` : ""}`}
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
        <PhotoLightbox images={images} startIndex={openAt} title={alt}
          open onOpenChange={(o) => !o && setOpenAt(null)} />
      )}
    </>
  );
}

function DayButton({ children, onClick, disabled, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8E6E0] bg-white text-[13px] font-semibold text-text-main
        hover:border-green-300 hover:text-green-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
    >
      {children}
    </button>
  );
}
