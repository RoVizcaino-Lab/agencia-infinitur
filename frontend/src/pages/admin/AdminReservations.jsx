import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const STATUSES = ["nuevo", "contactado", "confirmado", "cancelado"];

export default function AdminReservations() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/reservations").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/admin/reservations/${id}`, { status });
    toast.success("Actualizado");
    load();
  };
  const del = async (id) => {
    if (!window.confirm("¿Eliminar reserva?")) return;
    await api.delete(`/admin/reservations/${id}`);
    load();
  };

  return (
    <div data-testid="admin-reservations">
      <h2 className="font-heading text-3xl text-ink mb-6">Reservas / Solicitudes</h2>
      <div className="bg-white rounded-2xl border border-[#E5E0D8] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink/70 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Viaje</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Contacto</th>
              <th className="px-5 py-3 font-medium">Pers.</th>
              <th className="px-5 py-3 font-medium">Mensaje</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-[#E5E0D8] align-top">
                <td className="px-5 py-3 text-ink/60 whitespace-nowrap">{new Date(r.created_at).toLocaleDateString("es-MX")}</td>
                <td className="px-5 py-3 text-ink">{r.trip_title}</td>
                <td className="px-5 py-3 font-medium">{r.name}</td>
                <td className="px-5 py-3 text-ink/70">
                  <div>{r.email}</div>
                  <div>{r.phone}</div>
                </td>
                <td className="px-5 py-3">{r.people}</td>
                <td className="px-5 py-3 text-ink/70 max-w-xs truncate">{r.message || "—"}</td>
                <td className="px-5 py-3">
                  <select data-testid={`res-status-${r.id}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-[#E5E0D8] bg-bone text-xs">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <button data-testid={`del-res-${r.id}`} onClick={() => del(r.id)} className="p-1.5 hover:text-destructive"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="8" className="text-center py-10 text-ink/50">Sin reservas todavía</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
