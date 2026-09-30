// Map helpers that don't import Leaflet, so pages can check for coordinates
// without pulling the map library into the main bundle.

export const hasCoords = (s) => Number.isFinite(s?.lat) && Number.isFinite(s?.lng);

// Accepts "17.0654, -96.7236", "17.0654 -96.7236" or "17.0654,-96.7236" (the format Google Maps copies).
export function parseCoords(text) {
  const m = String(text || "").trim().match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: round6(lat), lng: round6(lng) };
}

export const round6 = (n) => Math.round(n * 1e6) / 1e6;

export const formatCoords = (s) => `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`;
