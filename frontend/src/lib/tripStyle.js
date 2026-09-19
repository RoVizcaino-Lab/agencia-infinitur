// Visual mapping per trip type (per Figma briefing).
import { UtensilsCrossed, Flag, Globe2 } from "lucide-react";

// Wraps an emoji glyph so it can be used as a drop-in icon component (size/strokeWidth compatible).
export function EmojiIcon(emoji) {
  return function Emoji({ size = 16, className = "" }) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }} role="img" aria-hidden="true">
        {emoji}
      </span>
    );
  };
}

export const TRIP_TYPES = [
  { key: "Clásico", icon: EmojiIcon("🏕️"), bg: "bg-[#D6EDCA]", fg: "text-green-800", chip: "bg-green-100 text-green-800" },
  { key: "Explora", icon: EmojiIcon("🧭"), bg: "bg-[#B8DFA4]", fg: "text-green-900", chip: "bg-green-200 text-green-900" },
  { key: "Mochilero", icon: EmojiIcon("🎒"), bg: "bg-[#FFE0C8]", fg: "text-orange-700", chip: "bg-orange-100 text-orange-700" },
  { key: "Infinitur 90°", icon: EmojiIcon("🏔️"), bg: "bg-[#E8D6BE]", fg: "text-[#7a5a36]", chip: "bg-[#F6E7D6] text-[#7a5a36]" },
  { key: "4 Elementos", icon: EmojiIcon("🌿"), bg: "bg-[#D9EFE4]", fg: "text-[#1F5D47]", chip: "bg-[#DCF1E7] text-[#1F5D47]" },
  { key: "Altruismo", icon: EmojiIcon("🎖️"), bg: "bg-[#D6EDCA]", fg: "text-green-700", chip: "bg-green-50 text-green-700" },
  { key: "Confort", icon: EmojiIcon("🏨"), bg: "bg-[#FFF3EC]", fg: "text-orange-700", chip: "bg-orange-50 text-orange-700" },
  { key: "A la Carta", icon: UtensilsCrossed, bg: "bg-[#EFEAE1]", fg: "text-[#6B705C]", chip: "bg-[#F1EEE7] text-[#5C6151]" },
];

export const TRIP_TYPE_DESCRIPTIONS = {
  "Clásico": "Equilibrio entre aventura, cultura y descanso. Hotel y campamento incluidos.",
  "Explora": "Lugares poco conocidos u olvidados por el turismo convencional.",
  "Mochilero": "Para universitarios. Festivales, playa, buena vibra y diversión.",
  "Infinitur 90°": "Adrenalina máxima: rapel, rafting, paracaídas, tirolesa.",
  "4 Elementos": "Yoga, temazcales, meditación y reconexión interior.",
  "Altruismo": "Turismo con impacto. Comunidades, conservación y donaciones.",
  "Confort": "Recorridos con todas las comodidades. Hotel, descanso y disfrute.",
  "A la Carta": "Tú decides destino, fechas y modalidad. Escríbenos y armamos tu viaje.",
};

export function getTripTypeStyle(type) {
  return TRIP_TYPES.find((t) => t.key === type) || TRIP_TYPES[0];
}

export const REGIONS = [
  { key: "Nacional", icon: Flag, chip: "bg-green-50 text-green-700" },
  { key: "Internacional", icon: Globe2, chip: "bg-[#EAF2FC] text-[#2B5C93]" },
];

export function getRegionStyle(region) {
  return REGIONS.find((r) => r.key === region) || REGIONS[0];
}

// Background illustration icon by region (used in trip detail hero)
export const REGION_ICONS = {
  Nacional: Flag,
  Internacional: Globe2,
};
