# INFINITUR — Product Requirements Document

## Original problem statement
Sitio web (frontend público + admin) para INFINITUR, una agencia de viajes mexicana freelance que organiza expediciones en grupos chicos (10-15 personas) por México, América y Europa, con viajes de 1 día a 1 semana. El usuario proporcionó un briefing Figma (`briefing_entrega_dev_infinitur.docx`) con el rediseño completo.

## User personas
- **Viajero potencial**: explora catálogo, ve fechas, reserva por WhatsApp o formulario.
- **Coordinador/admin (1 sólo)**: gestiona catálogo (Trips, Gallery, FAQ, Videos, Testimonials) vía panel admin.

## Stack
- Frontend: React, Tailwind, Shadcn UI, lucide-react.
- Backend: FastAPI, Motor (MongoDB).
- Auth: JWT en cookie httpOnly + memoria pura en frontend (refresh pierde sesión por diseño).
- Storage: Emergent Object Storage para imágenes.

## Paletas y tipografía
- Naranjas (`#EE7E2C`) + Verdes (`#4E7A1A`, `#D6EDCA`) + Bone/Cream.
- Tipografías: `Brygada 1918` (display) y `DM Sans` (UI).

## Estado actual — Fase 2 completa
Las 5 páginas del briefing Figma están implementadas y validadas:

### Páginas públicas
- **Home (`/`)** — Hero seccionado, calendario interactivo, 4 viajes destacados, gallery, FB videos. ✅
- **Destinos (`/destinos`)** — Hero "Elige tu próximo viaje", 8 chips de filtro con counts (Todos/Clásico/Explora/Aventura/Bienestar/Mochilero/Confort/Alturismo), grid 3 columnas de cards iconográficas, calendario, sección "A la carta". ✅
- **Destino Detalle (`/destinos/:id`)** — Breadcrumb, hero ilustrado con tags + precio "desde", secciones: Sobre/Lugares/Qué incluye/Itinerario/Otros destinos, aside sticky (Cupo limitado + Costo por viajero + Formas de pago + Reservar WA + Compartir), CTA dark. ✅
- **Conócenos (`/conocenos`)** — Hero con stats, grid asimétrico, Filosofía + El Guía, 4 Pilares (Grupos chicos/Coordinador/Rutas/Comunidad), Modalidades (7 tipos + A la carta), Testimonios, CTA dark. ✅
- **Lo que debes saber (`/lo-que-debes-saber`)** — 4 tabs (Cómo reservar / Seguro médico / Cancelaciones / Políticas de viaje) con paneles dinámicos. Toggle viajero/Infinitur en Cancelaciones. Banner WhatsApp footer. ✅
- **Contáctanos (`/contactanos`)** — Hero, CTA grande WhatsApp, formulario que POST → /api/reservations. ✅

### Admin
- `/admin/login` + `/admin/dashboard` con CRUDs: Trips, Gallery, FAQ, Videos, Testimonials. ✅

## Modelos de datos
### Trip (extendido)
```
title, destination, country, region, trip_type, description, long_description,
duration_days, start_date, end_date, price, currency, group_min/max, spots_left,
cover_image, images, itinerary, included, excluded, featured, active,
places[], pricing_tiers[{label,price,icon}], itinerary_pdf_url
```

### Migración automática
`_migrate_trip_fields()` corre en startup y rellena valores por defecto en trips legacy + asigna `trip_type` diverso vía heurística de keywords en el título.

## Endpoints clave
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/trips`, `GET /api/trips/:id`
- `GET/POST/DELETE /api/gallery`, `/api/videos`, `/api/testimonials`
- `GET/POST/PUT /api/faq`
- `POST /api/reservations` (público), `GET/PATCH /api/admin/reservations`
- `POST /api/storage/upload`

## Integraciones 3rd party
- Emergent Object Storage (sin API key)
- Facebook Video Embed (iframe estándar)
- WhatsApp link directo (`+52 ...`)

## Roadmap / Backlog
### P1 (mejoras de contenido)
- Cargar foto real del coordinador en Conócenos (ahora placeholder con ícono).
- Diversificar `trip_type` en `_seed_trips_if_empty()` directamente (en lugar de sólo en migración).
- Subir PDFs de itinerario por viaje (campo `itinerary_pdf_url` ya soporta).

### P2 (técnico)
- Split `server.py` (~870 líneas) en `/app/backend/routes/`.
- `init_storage()`/`put_object()` async wrappers en lugar de sync calls dentro de async handlers.
- Reemplazar `window.location` en `LegacyTripRedirect` por `<Navigate>` idiomático.
- Endpoint admin/reservations: validar `status` contra enum.
- CORS: restringir `allow_origin_regex` a dominio real en producción.

### P3 (futuro)
- Pasarela de pago directa (Stripe) para reservar online.
- Cuenta de viajero (login + historial).
- Notificaciones por email (Resend / SendGrid).
- SEO: meta tags dinámicos + sitemap.

## Testing status
- Backend: 33/33 pytest passing (`/app/backend/tests/`).
- Frontend: validado vía testing_agent_v3_fork en 5 páginas + flujos.
- Test reports: `/app/test_reports/iteration_{1,3,4}.json`.

## Credenciales
Ver `/app/memory/test_credentials.md`.

## 2026-06 Footer refinements
- Textos DM Sans del footer +3px (descripción 19px, links 17px, títulos col 15px, copyright 15px).
- Logo del footer con misma composición del navbar: marca PNG sin recuadro blanco + "INFINITUR" DM Sans bold blanco + "¡El viaje de los viajes!" en serif italic gris claro.
- Íconos sociales cuadrados (rounded-md) 48x48 con glifo blanco 24px.
- Banner WhatsApp (Home): botón rectangular rounded-xl con glifo oficial de WhatsApp (SVG inline `WhatsAppGlyph`).

## 2026-06 Chips de filtro "Tipo de viaje" (/destinos)
- 5 estados implementados en `FilterChip` (Trips.jsx): Default (blanco/borde arena), Hover (bg green-50 + borde green-400 + texto green-800), Activo (green-800 sólido, texto blanco), Activo Hover (green-700), Disabled (count 0: bg #F5F2EC, texto atenuado, no clickeable).
- Chips de Tipo en estado activo muestran ✕ para limpiar el filtro (testid `filter-{tipo}-clear`); el chip "Todos" no lleva ✕.

## 2026-06 Rediseño de Cards + catálogo completo
- `TripCard.jsx` rediseñada según maqueta: foto de portada (aspect 16/10), chips de tipo + Nacional/Internacional debajo de la foto, título serif, fecha con ícono naranja, "Lugares:", precio "desde $X MXN" en oscuro y botón verde oscuro rectangular (rounded-lg) con estados hover/active.
- Estado "Sin cupo": si `spots_left <= 0` la card se atenúa (data-soldout=true) y el CTA se vuelve un span deshabilitado "Sin cupo".
- Nueva taxonomía de tipos (tripStyle.js): Clásico, Explora, Mochilero, Infinitur 90°, 4 Elementos, Altruismo, Confort, A la Carta. Migración en backend (`renamed_types`): Aventura→Infinitur 90°, Bienestar→4 Elementos, Alturismo→Altruismo.
- `/destinos`: máximo 8 cards (grid de 4 columnas), orden por defecto "Fecha más próxima" + selector Ordenar por (fecha / precio asc / precio desc) y CTA "Seguir viendo más viajes".
- Nueva página `/todos-los-viajes` (`AllTrips.jsx`) con los 9 viajes y 3 grupos de filtros combinables: tipo de viaje, Nacional/Internacional y mes de salida, más selector de orden.
- Admin `AdminTrips.jsx`: selects de "Tipo de viaje" y "Destino" (Nacional/Internacional) y campo "Lugares del viaje".
- Corregida imagen roto del viaje "Cañón del Sumidero" (DB + seed).
- Validado por testing_agent: iteration_11.json — backend 3/3 y frontend 100%, sin issues.

## 2026-06 Página de detalle de viaje (Destinos_3.png)
- `TripDetail.jsx` rehecha según maqueta: barra de breadcrumb clara, hero full-bleed con foto de portada + degradado, chips (tipo + Nacional/Internacional), título blanco, fecha "X al Y de mes, año – N días" y tarjeta de precio "desde $X / MXN por persona" arriba a la derecha.
- Columna izquierda con divisores: Sobre este viaje, Lugares a visitar (pills verdes), ¿Qué incluye? (tarjetas con ícono), **No incluye** (nueva sección con `trip.excluded` y fallback), Itinerario (botón Descargar PDF).
- Aside sticky dentro de una tarjeta blanca: Cupo limitado (barra naranja), Costo por viajero (precios en oscuro), Formas de pago (pills), botón verde "Reservar por Whatsapp" (rectangular + glifo WhatsApp) y "Compartir este viaje".
- Cierre con "Otros destinos que te pueden gustar" (3 cards nuevas) y banner oscuro de WhatsApp igual al de Home.
- Nuevo componente compartido `components/WhatsAppGlyph.jsx`.
