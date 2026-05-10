import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Trips from "@/pages/Trips";
import TripDetail from "@/pages/TripDetail";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import "@/App.css";

function PublicShell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppShell() {
  const loc = useLocation();
  const isAdmin = loc.pathname.startsWith("/admin");
  return isAdmin ? null : null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<PublicShell><Home /></PublicShell>} />
          <Route path="/viajes" element={<PublicShell><Trips /></PublicShell>} />
          <Route path="/viajes/:id" element={<PublicShell><TripDetail /></PublicShell>} />
          <Route path="/galeria" element={<PublicShell><Gallery /></PublicShell>} />
          <Route path="/sobre-mi" element={<PublicShell><About /></PublicShell>} />
          <Route path="/contacto" element={<PublicShell><Contact /></PublicShell>} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
