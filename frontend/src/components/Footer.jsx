import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";

const conocenos = [
  { to: "/conocenos", label: "Nuestra historia" },
  { to: "/conocenos#filosofia", label: "Filosofía" },
  { to: "/conocenos#logo", label: "Nuestro logo" },
  { to: "/conocenos#blog", label: "Blog" },
];

const debesSaber = [
  { to: "/lo-que-debes-saber#seguro", label: "Seguro médico" },
  { to: "/lo-que-debes-saber#politicas", label: "Políticas del viajero" },
  { to: "/lo-que-debes-saber#tipos", label: "Tipos de viaje" },
  { to: "/lo-que-debes-saber#cancelaciones", label: "Cancelaciones" },
];

const socials = [
  { href: "https://instagram.com/marinerus.infinitur", icon: Instagram, label: "Instagram" },
  { href: "https://www.facebook.com/marinerus.infinitur", icon: Facebook, label: "Facebook" },
  { href: "https://www.tiktok.com/@marinerus.infinitur", icon: TikTokIcon, label: "TikTok" },
  { href: "https://youtube.com/@marinerus.infinitur", icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-carbon text-white/90">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center">
              <img src="/infinitur-logo.png" alt="INFINITUR" className="w-full h-full object-contain" />
            </span>
            <span className="font-display text-2xl tracking-wide text-white font-bold">INFINITUR</span>
          </div>
          <p className="text-white/70 leading-relaxed max-w-sm">
            Tours en grupos pequeños por México, América y Europa. Con un guía que te trata como amigo.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <s.icon size={16} className="text-white" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="CONÓCENOS" items={conocenos} />
        <FooterCol title="LO QUE DEBES SABER" items={debesSaber} />
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} INFINITUR · Tours en grupos pequeños · viajesinfinitur.com
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div className="md:col-span-3">
      <div className="font-ui uppercase text-xs tracking-[0.18em] text-orange-500 font-bold mb-4">{title}</div>
      <ul className="space-y-2.5 text-sm">
        {items.map((it) => (
          <li key={it.label}>
            <Link to={it.to} className="text-white/80 hover:text-white">{it.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TikTokIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.93Z" />
    </svg>
  );
}
