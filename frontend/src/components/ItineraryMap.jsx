import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { hasCoords } from "@/lib/geo";

// On phones one finger keeps scrolling the page; two fingers pan/zoom the map (Leaflet touchZoom).
const IS_MOBILE = L.Browser.mobile;

export const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const numberIcon = (n) =>
  L.divIcon({
    className: "",
    html: `<span class="itin-marker">${n}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });

function FitToPoints({ points }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    // Max zoom 11 keeps the basemap at "region" level instead of street detail.
    // Extra top-left padding keeps markers clear of the +/- buttons.
    const fit = () => {
      if (points.length === 1) map.setView([points[0].lat, points[0].lng], 11);
      else map.fitBounds(points.map((p) => [p.lat, p.lng]), { paddingTopLeft: [56, 40], paddingBottomRight: [40, 40], maxZoom: 11 });
    };
    map.invalidateSize();
    fit();
    // Re-fit when the container gets its final size (lazy load, phone rotation, window resize)
    const ro = new ResizeObserver(() => { map.invalidateSize(); fit(); });
    ro.observe(map.getContainer());
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

/**
 * Map of one itinerary day. `stops` is the full list of the day; stops without
 * coordinates are skipped but keep their list number, so map and list match.
 */
export default function ItineraryMap({ stops }) {
  const points = stops
    .map((s, i) => ({ ...s, n: i + 1 }))
    .filter(hasCoords);
  if (points.length === 0) return null;

  return (
    <div className="isolate" data-testid="itinerary-map">
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={12}
        scrollWheelZoom={false}
        dragging={!IS_MOBILE}
        className="h-[260px] sm:h-[340px] w-full rounded-2xl border border-[#E8E6E0] bg-[#EFEAE1]"
      >
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
        {points.length > 1 && (
          <Polyline positions={points.map((p) => [p.lat, p.lng])}
            pathOptions={{ className: "itin-route", weight: 3, lineCap: "round", lineJoin: "round" }} />
        )}
        {points.map((p) => (
          <Marker key={p.n} position={[p.lat, p.lng]} icon={numberIcon(p.n)} title={`${p.n}. ${p.title}`}>
            <Popup>
              <span className="font-semibold text-text-main">{p.n}. {p.title}</span>
            </Popup>
          </Marker>
        ))}
        <FitToPoints points={points} />
      </MapContainer>
      {IS_MOBILE && (
        <p className="mt-1.5 text-[11px] text-text-sec/80 text-center">Usa dos dedos para mover el mapa</p>
      )}
    </div>
  );
}
