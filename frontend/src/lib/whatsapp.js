// WhatsApp helper for all CTAs across the site.
// Phone numbers managed centrally; messages are context-specific.

export const WA_NUMBER = "5215536542741";
export const WA_DISPLAY = "55 3654 2741";

export function waLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  navbar: "Hola, me interesa conocer más sobre Infinitur. ¿Me pueden dar información sobre sus próximos viajes?",
  homeBanner: "Hola 👋 Tengo una duda sobre los viajes de Infinitur. ¿Me pueden ayudar?",
  reservar: (name, start, end) =>
    `Hola, quiero reservar mi lugar en ${name} (${start} al ${end}). ¿Me pueden dar los detalles?`,
  destinosCalendario: (name, start, end) =>
    `Hola, vi el calendario y me interesa el viaje a ${name} del ${start} al ${end}. ¿Tienen lugares disponibles?`,
  aLaCarta: "Hola, me gustaría armar un viaje a la carta. ¿Me pueden orientar sobre las opciones y precios?",
  general: "Hola, leí la información de su sitio y tengo una duda sobre las políticas y condiciones de los viajes.",
  seguro: "Hola, me interesa contratar el Seguro Médico Infinitur para mi próximo viaje. ¿Me pueden dar los detalles?",
  cancelaciones: "Hola, necesito hacer un cambio o cancelación en mi reservación. ¿Me pueden ayudar?",
  conocenos: "Hola, me interesa conocer más sobre Infinitur y sus próximos viajes.",
};
