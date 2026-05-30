import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-ink text-white/85 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center">
              <img src="/infinitur-logo.png" alt="INFINITUR" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-heading text-3xl text-white tracking-wide">INFINITUR</div>
              <div className="text-xs text-terracotta italic">¡El viaje de los viajes!</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-white/70 leading-relaxed">
            Viajes en grupos chicos por México, América y Europa. Aventuras auténticas conducidas por un guía local con más de 10 años de experiencia.
          </p>
        </div>
        <div>
          <div className="font-accent uppercase text-xs tracking-widest text-terracotta mb-4">Explorar</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/viajes" className="hover:text-white">Próximos viajes</Link></li>
            <li><Link to="/galeria" className="hover:text-white">Galería</Link></li>
            <li><Link to="/sobre-mi" className="hover:text-white">Sobre el guía</Link></li>
            <li><Link to="/faq" className="hover:text-white">Preguntas frecuentes</Link></li>
            <li><Link to="/contacto" className="hover:text-white">Reservar</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-accent uppercase text-xs tracking-widest text-terracotta mb-4">Contacto</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Phone size={14} /> +52 55 1234 5678</li>
            <li className="flex items-center gap-2"><Mail size={14} /> hola@infinitur.mx</li>
            <li className="flex items-center gap-2"><Instagram size={14} /> @infinitur.mx</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} INFINITUR · Hecho con cariño para viajeros curiosos.
      </div>
    </footer>
  );
}
