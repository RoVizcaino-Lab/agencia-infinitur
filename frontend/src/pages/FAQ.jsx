import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

export default function FAQ() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => { api.get("/faq").then((r) => setItems(r.data)); }, []);

  return (
    <div data-testid="faq-page" className="pt-32 pb-24 bg-bone min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            <HelpCircle size={14} /> Preguntas frecuentes
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl text-ink mb-5">
            Todo lo que <span className="text-orange-500 italic">quieres saber</span>
          </h1>
          <p className="text-ink/70 text-lg max-w-2xl mx-auto">
            Reservas, pagos, cancelaciones... aquí te resolvemos las dudas más comunes. ¿No encuentras la tuya? Escríbenos por WhatsApp.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((f, i) => (
            <div
              key={f.id}
              data-testid={`faq-item-${i}`}
              className={`bg-white border-2 rounded-2xl overflow-hidden transition-all ${
                open === i ? "border-orange-400 shadow-soft" : "border-[#E5E0D8]"
              }`}
            >
              <button
                data-testid={`faq-toggle-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-orange-50/50 transition-colors"
              >
                <span className="font-heading text-xl text-ink">{f.question}</span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-orange-500 transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5 pt-1 text-ink/75 leading-relaxed">{f.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-8 sm:p-10 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl mb-3">¿Otra duda? Pregúntanos</h2>
          <p className="text-white/85 mb-6">Te respondemos en menos de 2 horas por WhatsApp.</p>
          <a
            href="https://wa.me/525512345678"
            target="_blank"
            rel="noreferrer"
            data-testid="faq-whatsapp-cta"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-7 py-3.5 rounded-full font-bold hover:scale-105 transition-transform"
          >
            <MessageCircle size={18} fill="currentColor" /> Escribir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
