import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { OSM_TILES, OSM_ATTRIBUTION } from "@/components/ItineraryMap";
import { hasCoords, round6 } from "@/lib/geo";

const MEXICO = { center: [23.6, -102.5], zoom: 4 };

const pinIcon = L.divIcon({
  className: "",
  html: '<span class="itin-marker">●</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function ClickToPlace({ onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: round6(e.latlng.lat), lng: round6(e.latlng.lng) }) });
  return null;
}

// Re-center when the point changes from outside the map (search result, pasted coords)
function FollowPoint({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat == null || lng == null) return;
    // Zoom in when the point is off-screen or the map is still at country level
    if (!map.getBounds().contains([lat, lng]) || map.getZoom() < 11) {
      map.setView([lat, lng], Math.max(map.getZoom(), 14));
    }
  }, [map, lat, lng]);
  return null;
}

/**
 * Admin map to set a stop location: click to place the pin, drag it to adjust.
 * `hint` (another stop of the same day) is where the map starts when the stop has no location yet.
 */
export default function LocationPickerMap({ value, hint, onPick }) {
  const point = hasCoords(value) ? { lat: value.lat, lng: value.lng } : null;
  const start = point || (hasCoords(hint) ? hint : null);
  const handlers = useMemo(() => ({
    dragend: (e) => {
      const ll = e.target.getLatLng();
      onPick({ lat: round6(ll.lat), lng: round6(ll.lng) });
    },
  }), [onPick]);

  return (
    <MapContainer
      center={start ? [start.lat, start.lng] : MEXICO.center}
      zoom={start ? 12 : MEXICO.zoom}
      scrollWheelZoom
      className="isolate h-[240px] w-full rounded-lg border border-[#E5E0D8] bg-[#EFEAE1] cursor-crosshair"
    >
      <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} />
      <ClickToPlace onPick={onPick} />
      <FollowPoint lat={point?.lat} lng={point?.lng} />
      {point && <Marker position={[point.lat, point.lng]} icon={pinIcon} draggable eventHandlers={handlers} />}
    </MapContainer>
  );
}
