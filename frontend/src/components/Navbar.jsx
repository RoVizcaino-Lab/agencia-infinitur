import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { waLink, WA_MESSAGES } from "@/lib/whatsapp";

const links = [
  { to: "/destinos", label: "Destinos" },
  { to: "/conocenos", label: "Conócenos" },
  { to: "/lo-que-debes-saber", label: "Lo que debes saber" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header data-testid="site-navbar" className="sticky top-0 left-0 right-0 z-50 bg-bone/95 backdrop-blur-md border-b border-[#E8E6E0]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 flex items-center justify-between h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5">
          <span className="flex-shrink-0 w-11 h-11 rounded-lg bg-white border border-[#E8E6E0] flex items-center justify-center">
            <img src="/infinitur-logo.png" alt="INFINITUR" className="w-full h-full object-contain p-0.5" />
          </span>
          <span
            className="leading-none text-orange-500"
            style={{ fontFamily: "'Brygada 1918', Georgia, serif", fontWeight: 700 }}
          >
            <span className="block text-2xl tracking-wide">INFINITUR</span>
            <span
              className="block text-[11px] mt-1 text-text-sec tracking-[0.02em]"
              style={{ fontFamily: "'Brygada 1918', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
            >
              ¡El viaje de los viajes!
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors ${
                    isActive ? "text-green-700" : "text-text-main hover:text-green-700"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <a
            href={waLink(WA_MESSAGES.navbar)}
            target="_blank"
            rel="noreferrer"
            data-testid="navbar-cta-contactanos"
            className="hidden sm:inline-flex btn-whatsapp items-center gap-2 px-5 lg:px-6 py-2.5 rounded-full font-semibold text-sm"
          >
            <MessageCircle size={16} fill="white" /> Contáctanos
          </a>
          <button
            data-testid="mobile-menu-toggle"
            className="lg:hidden text-ink"
            onClick={() => setOpen((v) => !v)}
            aria-label="menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-[#E8E6E0] px-6 py-6 space-y-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block text-ink hover:text-orange-500 font-medium">
              {l.label}
            </Link>
          ))}
          <a href={waLink(WA_MESSAGES.navbar)} target="_blank" rel="noreferrer"
            className="btn-whatsapp inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm">
            <MessageCircle size={16} fill="white" /> Contáctanos
          </a>
        </div>
      )}
    </header>
  );
}
