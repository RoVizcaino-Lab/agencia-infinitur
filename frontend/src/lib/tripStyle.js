// Visual mapping per trip type (per Figma briefing).
// Used to render iconographic cards instead of photo-based ones.
import {
  Compass,
  TreePine,
  Mountain,
  Sparkles,
  Backpack,
  Bed,
  Heart,
  Globe2,
  Waves,
} from "lucide-react";

export const TRIP_TYPES = [
  { key: "Clásico", icon: Compass, bg: "bg-[#D6EDCA]", fg: "text-green-800", chip: "bg-green-100 text-green-700" },
  { key: "Explora", icon: TreePine, bg: "bg-[#B8DFA4]", fg: "text-green-900", chip: "bg-green-200 text-green-800" },
  { key: "Aventura", icon: Mountain, bg: "bg-[#E8D6BE]", fg: "text-[#7a5a36]", chip: "bg-orange-100 text-orange-700" },
  { key: "Bienestar", icon: Sparkles, bg: "bg-[#F0F7EA]", fg: "text-green-700", chip: "bg-green-50 text-green-700" },
  { key: "Mochilero", icon: Backpack, bg: "bg-[#FFE0C8]", fg: "text-orange-700", chip: "bg-orange-100 text-orange-700" },
  { key: "Confort", icon: Bed, bg: "bg-[#FFF3EC]", fg: "text-orange-700", chip: "bg-orange-50 text-orange-700" },
  { key: "Alturismo", icon: Heart, bg: "bg-[#D6EDCA]", fg: "text-green-700", chip: "bg-green-100 text-green-700" },
];

export const TRIP_TYPE_DESCRIPTIONS = {
  Clásico: "Equilibrio perfecto entre aventura, cultura y descanso. Mezclamos lugares naturales con noches de hotel y campamentos.",
  Explora: "Lugares y rincones de México desconocidos por el turismo convencional. Rutas que ninguna otra agencia ofrece.",
  Aventura: "Adrenalina al máximo: rapel, rafting, tirolesa, espeleología y más. Los límites los pones tú.",
  Bienestar: "Yoga, temazcales, meditación y toltequeidad. Redescubre tu cuerpo y mente.",
  Mochilero: "Toda la magia del viaje como antaño. Para universitarios con festivales, playa y buena vibra.",
  Confort: "Recorridos por lugares bellos con todas las comodidades. Conoces, disfrutas y descansas.",
  Alturismo: "Turismo con impacto. Conservación, donaciones canalizadas y aporte a comunidades.",
};

export function getTripTypeStyle(type) {
  return TRIP_TYPES.find((t) => t.key === type) || TRIP_TYPES[0];
}

// Background illustration icon by region (used in trip detail hero)
export const REGION_ICONS = {
  Nacional: Waves,
  Internacional: Globe2,
};
