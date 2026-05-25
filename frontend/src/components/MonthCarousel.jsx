import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  { n: 1, name: "Enero", img: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800" },
  { n: 2, name: "Febrero", img: "https://images.unsplash.com/photo-1518803194621-27188ba362c9?w=800" },
  { n: 3, name: "Marzo", img: "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg?w=800" },
  { n: 4, name: "Abril", img: "https://images.unsplash.com/photo-1606403759369-e10299ed5740?w=800" },
  { n: 5, name: "Mayo", img: "https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg?w=800" },
  { n: 6, name: "Junio", img: "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?w=800" },
  { n: 7, name: "Julio", img: "https://images.unsplash.com/photo-1521437687640-34c398f4e598?w=800" },
  { n: 8, name: "Agosto", img: "https://images.unsplash.com/photo-1629752123286-49a7f60571f3?w=800" },
  { n: 9, name: "Septiembre", img: "https://images.pexels.com/photos/6125816/pexels-photo-6125816.jpeg?w=800" },
  { n: 10, name: "Octubre", img: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800" },
  { n: 11, name: "Noviembre", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800" },
  { n: 12, name: "Diciembre", img: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800" },
];

export default function MonthCarousel() {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section className="py-20 sm:py-28 bg-bone relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-yellow-200/40 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-orange-600 mb-3">
              <span className="w-8 h-px bg-orange-500" /> Calendario de aventuras
            </div>
            <h2 className="font-heading text-4xl sm:text-5xl text-ink">
              ¿Cuándo te vas de viaje?
            </h2>
            <p className="text-ink/70 mt-3 max-w-xl">Elige tu mes y descubre los viajes que tenemos preparados.</p>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="month-prev"
              onClick={() => scroll(-1)}
              className="w-11 h-11 rounded-full bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              data-testid="month-next"
              onClick={() => scroll(1)}
              className="w-11 h-11 rounded-full bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all flex items-center justify-center"
              aria-label="Siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MONTHS.map((m, i) => (
            <Link
              key={m.n}
              to={`/viajes?mes=${m.n}`}
              data-testid={`month-card-${m.n}`}
              className="snap-start group flex-shrink-0 w-[260px] sm:w-[300px] rounded-3xl overflow-hidden bg-white border-2 border-transparent hover:border-orange-400 shadow-soft hover:shadow-floating hover:-translate-y-2 transition-all duration-300 relative"
              style={{ transform: i % 2 === 0 ? "rotate(-0.5deg)" : "rotate(0.5deg)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-orange-600">
                  {String(m.n).padStart(2, "0")}
                </div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="font-heading text-3xl leading-tight">{m.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-sm bg-orange-500 px-3 py-1 rounded-full font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Ver viajes →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
