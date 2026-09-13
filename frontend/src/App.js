import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Trips from "@/pages/Trips";
import AllTrips from "@/pages/AllTrips";
import TripDetail from "@/pages/TripDetail";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import "@/App.css";

function PublicShell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/" element={<PublicShell><Home /></PublicShell>} />

          {/* New routes per Infinitur briefing */}
          <Route path="/destinos" element={<PublicShell><Trips /></PublicShell>} />
          <Route path="/todos-los-viajes" element={<PublicShell><AllTrips /></PublicShell>} />
          <Route path="/destinos/:id" element={<PublicShell><TripDetail /></PublicShell>} />
          <Route path="/conocenos" element={<PublicShell><About /></PublicShell>} />
          <Route path="/lo-que-debes-saber" element={<PublicShell><FAQ /></PublicShell>} />
          <Route path="/contactanos" element={<PublicShell><Contact /></PublicShell>} />

          {/* Legacy routes (kept for backwards compat — redirect to new ones) */}
          <Route path="/viajes" element={<Navigate to="/destinos" replace />} />
          <Route path="/viajes/:id" element={<LegacyTripRedirect />} />
          <Route path="/sobre-mi" element={<Navigate to="/conocenos" replace />} />
          <Route path="/faq" element={<Navigate to="/lo-que-debes-saber" replace />} />
          <Route path="/contacto" element={<Navigate to="/contactanos" replace />} />

          <Route path="/galeria" element={<PublicShell><Gallery /></PublicShell>} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

function LegacyTripRedirect() {
  const path = window.location.pathname.replace("/viajes/", "/destinos/");
  return <Navigate to={path} replace />;
}

export default App;
