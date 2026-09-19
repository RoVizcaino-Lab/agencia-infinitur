import { useEffect, useState } from "react";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";

export default function WhatsAppButton() {
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 1800);
    const h = setTimeout(() => setHint(false), 8000);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, []);

  return (
    <a
      href={waLink(WA_MESSAGES.homeBanner)}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-6 right-6 z-[60] group"
    >
      {hint && (
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white border border-[#E8E6E0] text-text-main text-sm px-4 py-2 rounded-full shadow-floating">
          ¿Tienes dudas? <span className="font-bold text-whatsapp">¡Escríbeme!</span>
        </span>
      )}
      <span className="block relative">
        <span className="absolute inset-0 rounded-full bg-whatsapp animate-ping opacity-25" />
        <span className="relative w-16 h-16 rounded-full bg-whatsapp hover:bg-[#1ebd5b] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-all duration-300 group-hover:scale-110">
          <WhatsAppGlyph size={30} className="text-white" />
        </span>
      </span>
    </a>
  );
}
