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
