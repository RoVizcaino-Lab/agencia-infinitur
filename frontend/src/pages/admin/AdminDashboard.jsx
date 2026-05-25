import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminTrips from "./AdminTrips";
import AdminReservations from "./AdminReservations";
import AdminGallery from "./AdminGallery";
import AdminTestimonials from "./AdminTestimonials";
import AdminFAQ from "./AdminFAQ";
import { LogOut, Plane, Inbox, Image as ImageIcon, Quote, ExternalLink, HelpCircle } from "lucide-react";

const TABS = [
  { key: "trips", label: "Viajes", icon: Plane, comp: AdminTrips },
  { key: "reservations", label: "Reservas", icon: Inbox, comp: AdminReservations },
  { key: "gallery", label: "Galería", icon: ImageIcon, comp: AdminGallery },
  { key: "testimonials", label: "Testimonios", icon: Quote, comp: AdminTestimonials },
  { key: "faq", label: "FAQ", icon: HelpCircle, comp: AdminFAQ },
];

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("trips");

  if (loading) return <div className="pt-40 text-center text-ink/60">Cargando…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;

  const Active = TABS.find((t) => t.key === tab).comp;

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-bone">
      <header className="bg-white border-b border-[#E5E0D8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-heading text-xl text-ink">Panel · Senderos<span className="text-terracotta">.</span></div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-sm text-ink/60 hover:text-terracotta inline-flex items-center gap-1">
              Ver sitio <ExternalLink size={14} />
            </Link>
            <button data-testid="admin-logout" onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E0D8] text-sm hover:border-terracotta hover:text-terracotta">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} data-testid={`tab-${t.key}`} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
                tab === t.key ? "border-terracotta text-terracotta" : "border-transparent text-ink/60 hover:text-ink"
              }`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <Active />
      </main>
    </div>
  );
}
