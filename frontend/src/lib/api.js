import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Resolve image URLs that may be relative ('/api/files/<id>') or already absolute
export function resolveImage(u) {
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${BACKEND_URL}${u.startsWith("/") ? u : "/" + u}`;
}

const api = axios.create({ baseURL: API });

// In-memory token (cleared on page refresh). Reduces XSS persistence vector vs. localStorage/sessionStorage.
let _token = null;

api.interceptors.request.use((cfg) => {
  if (_token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${_token}` };
  return cfg;
});

export function setToken(t) {
  _token = t || null;
}

export function getToken() {
  return _token;
}

export function formatApiError(detail) {
  if (detail == null) return "Algo salió mal. Inténtalo de nuevo.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;
