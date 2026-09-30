import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { resolveImage } from "@/lib/api";

/**
 * Full-size photo viewer. Opens on `startIndex`; with more than one photo
 * it becomes a carousel (arrows, swipe and keyboard ← →).
 */
export default function PhotoLightbox({ images, startIndex, open, onOpenChange, title }) {
  const contentRef = useRef(null);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(startIndex);
  const many = images.length > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  // ← → work anywhere while open. The carousel only listens when focus is inside it, and
  // focus drops to <body> when an arrow button becomes disabled at either end.
  // If the carousel already handled the key it calls preventDefault, so we skip it.
  useEffect(() => {
    if (!open || !api) return;
    const onKey = (e) => {
      if (e.defaultPrevented) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); api.scrollPrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); api.scrollNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, api]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="photo-lightbox"
        ref={contentRef}
        overlayClassName="bg-black/95"
        // Focus the viewer itself (not the close button, which would show a focus ring on open)
        onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus(); }}
        className="max-w-5xl w-[calc(100vw-2rem)] p-0 border-0 focus:outline-none bg-transparent shadow-none sm:rounded-none gap-0
          [&>button:last-child]:text-white [&>button:last-child]:opacity-90 [&>button:last-child]:-top-9 [&>button:last-child]:right-0"
      >
        <DialogTitle className="sr-only">{title || "Fotos"}</DialogTitle>
        <DialogDescription className="sr-only">Vista ampliada de las fotos de la parada</DialogDescription>
        <Carousel setApi={setApi} opts={{ startIndex, loop: false }} className="w-full">
          <CarouselContent>
            {images.map((src, k) => (
              <CarouselItem key={k} className="flex items-center justify-center">
                <img src={resolveImage(src)} alt={title || ""}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl" />
              </CarouselItem>
            ))}
          </CarouselContent>
          {many && (
            <>
              <CarouselPrevious data-testid="lightbox-prev"
                className="left-2 sm:-left-14 h-10 w-10 bg-white/90 hover:bg-white border-0 text-text-main" />
              <CarouselNext data-testid="lightbox-next"
                className="right-2 sm:-right-14 h-10 w-10 bg-white/90 hover:bg-white border-0 text-text-main" />
            </>
          )}
        </Carousel>
        <div className="mt-3 text-center text-white/90 text-sm">
          {title && <span className="font-semibold">{title}</span>}
          {many && <span data-testid="lightbox-counter">{title ? " · " : ""}{current + 1} / {images.length}</span>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
