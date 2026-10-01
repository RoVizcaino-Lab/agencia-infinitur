import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import WhatsAppGlyph from "@/components/WhatsAppGlyph";

const links = [
  { to: "/destinos", label: "Destinos" },
  { to: "/#calendario", label: "Calendario" }, // home page section "Calendario de aventuras"
  { to: "/conocenos", label: "Conócenos" },
  { to: "/galeria", label: "Galería" },
  { to: "/lo-que-debes-saber", label: "Lo que debes saber" },
];

// NavLink only compares paths, so "/#calendario" would look active on the whole home page
const isLinkActive = (to, loc) => {
  const [path, hash] = to.split("#");
  return hash ? loc.pathname === path && loc.hash === `#${hash}` : loc.pathname.startsWith(path);
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  // key: also close the mobile menu for "Calendario" clicked while already on the home page
  useEffect(() => setOpen(false), [loc.pathname, loc.hash, loc.key]);

  return (
    <header data-testid="site-navbar" className="sticky top-0 left-0 right-0 z-50 bg-bone/95 backdrop-blur-md border-b border-[#E8E6E0]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-20 flex items-center justify-between gap-6 h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3 h-full py-2">
          <img
            src="/infinitur-logo-color.jpg"
            alt="INFINITUR"
            className="h-full w-auto object-contain flex-shrink-0 bg-white rounded-xl p-0.5"
          />
          <span className="leading-none text-orange-500">
            <span
              className="block text-2xl tracking-wide"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}
            >
              INFINITUR
            </span>
            <span
              className="block text-[11px] mt-1 text-text-sec tracking-[0.02em]"
              style={{ fontFamily: "'Brygada 1918', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}
            >
              ¡El viaje de los viajes!
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-5 xl:gap-8">
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                className={`text-sm font-medium tracking-wide whitespace-nowrap transition-colors ${
                  isLinkActive(l.to, loc) ? "text-green-700" : "text-text-main hover:text-green-700"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/contactanos"
            data-testid="navbar-cta-contactanos"
            className="hidden sm:inline-flex btn-whatsapp items-center gap-2 whitespace-nowrap px-5 xl:px-6 py-2.5 rounded-full font-semibold text-sm"
          >
            <WhatsAppGlyph size={16} /> Contáctanos
          </Link>
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
            <Link key={l.to} to={l.to} data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              // Close in the same click: the open menu adds height to the header, and the
              // "Calendario" scroll must be measured with it already closed
              onClick={() => setOpen(false)}
              className="block text-ink hover:text-orange-500 font-medium">
              {l.label}
            </Link>
          ))}
          <Link to="/contactanos" data-testid="navbar-cta-contactanos-mobile"
            className="btn-whatsapp inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm">
            <WhatsAppGlyph size={16} /> Contáctanos
          </Link>
        </div>
      )}
    </header>
  );
}
