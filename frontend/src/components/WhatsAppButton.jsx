import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

// TODO: reemplaza este número por el real (con código de país, sin signos)
const WA_NUMBER = "525512345678";
const DEFAULT_MSG = "¡Hola! Me interesa viajar con Senderos.";

export default function WhatsAppButton() {
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 1500);
    const h = setTimeout(() => setHint(false), 7000);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, []);

  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(DEFAULT_MSG)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-6 right-6 z-[60] group"
    >
      {hint && (
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white border border-orange-200 text-ink text-sm px-4 py-2 rounded-full shadow-floating animate-fade-in-up">
          ¿Tienes dudas? <span className="font-bold text-[#25D366]">¡Escríbeme!</span>
        </span>
      )}
      <span className="block relative">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        <span className="relative w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#1ebd5b] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-[8deg]">
          <MessageCircle size={28} className="text-white" strokeWidth={2.2} fill="white" />
        </span>
      </span>
    </a>
  );
}
