import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const { user, login, loading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="pt-40 text-center text-ink/60">Cargando…</div>;
  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Bienvenido");
      nav("/admin");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-bone flex items-center justify-center px-4">
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-soft">
        <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
          <Lock size={20} />
        </div>
        <h1 className="font-heading text-3xl text-ink mb-2">Panel de administración</h1>
        <p className="text-ink/60 mb-6 text-sm">Inicia sesión para gestionar viajes y reservas.</p>
        <form onSubmit={submit} className="space-y-4">
          <input data-testid="admin-email" type="email" required placeholder="Correo"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
          <input data-testid="admin-password" type="password" required placeholder="Contraseña"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] bg-bone focus:outline-none focus:border-terracotta" />
          <button data-testid="admin-login-submit" disabled={submitting}
            className="w-full btn-terracotta py-3.5 rounded-full font-semibold disabled:opacity-60">
            {submitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
