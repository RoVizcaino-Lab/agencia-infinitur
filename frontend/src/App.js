import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Trips from "@/pages/Trips";
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
          <Route path="/viajes" element={<PublicShell><Trips /></PublicShell>} />
          <Route path="/viajes/:id" element={<PublicShell><TripDetail /></PublicShell>} />
          <Route path="/galeria" element={<PublicShell><Gallery /></PublicShell>} />
          <Route path="/sobre-mi" element={<PublicShell><About /></PublicShell>} />
          <Route path="/faq" element={<PublicShell><FAQ /></PublicShell>} />
          <Route path="/contacto" element={<PublicShell><Contact /></PublicShell>} />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
