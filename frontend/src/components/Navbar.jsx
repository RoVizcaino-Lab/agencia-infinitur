import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/viajes", label: "Viajes" },
  { to: "/galeria", label: "Galería" },
  { to: "/sobre-mi", label: "INFINITUR" },
  { to: "/faq", label: "FAQ" },
  { to: "/contacto", label: "Contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "backdrop-blur-xl bg-white/80 border-b border-[#E5E0D8]" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-colors ${scrolled ? "bg-white" : "bg-white/95"}`}>
            <img src="/infinitur-logo.png" alt="INFINITUR" className="w-full h-full object-contain p-1" />
          </span>
          <span className="leading-tight">
            <span className={`block font-heading text-2xl sm:text-3xl tracking-wide ${scrolled ? "text-ink" : "text-white drop-shadow-md"}`}>
              INFINITUR
            </span>
            <span className={`hidden sm:block text-[11px] uppercase tracking-[0.2em] font-semibold ${scrolled ? "text-terracotta" : "text-white/85"}`}>
              ¡El viaje de los viajes!
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `text-sm tracking-wide font-medium transition-colors ${
                  scrolled
                    ? isActive
                      ? "text-terracotta"
                      : "text-ink/80 hover:text-terracotta"
                    : isActive
                    ? "text-white"
                    : "text-white/85 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/contacto"
            data-testid="navbar-cta-reservar"
            className="btn-terracotta inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Reservar
          </Link>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className={`md:hidden ${scrolled ? "text-ink" : "text-white"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-[#E5E0D8] px-6 py-6 space-y-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-mobile-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className="block text-ink hover:text-terracotta font-medium"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/contacto"
            data-testid="navbar-mobile-cta"
            className="btn-terracotta inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Reservar
          </Link>
        </div>
      )}
    </header>
  );
}
