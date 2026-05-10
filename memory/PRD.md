# PRD — Senderos Auténticos (Agencia de viajes)

## Original problem statement
Sitio web con front + panel de admin para una agencia de viajes pequeña tipo freelance. Un guía organiza grupos de 10-15 personas para destinos en México, América y Europa. Duración de viajes: 1 día hasta 1 semana.

## User choices (10/Feb/2026)
- (1e) Funciones públicas: catálogo, reserva/contacto, galería, sobre el guía + testimonios
- (2d) Admin completo: CRUD viajes, reservas, galería, testimonios
- (3a) Solo formulario de contacto (sin pagos online; CTA WhatsApp/email)
- (4a) Auth JWT custom para admin
- (5a) Estilo cálido/aventurero (terracota + bone)

## Architecture
- Backend: FastAPI + MongoDB (motor) + bcrypt + PyJWT
- Frontend: React + Tailwind + shadcn UI + sonner toasts + react-router
- Auth: Bearer token (localStorage `admin_token`); también soporta cookie fallback
- Idiomas: ES; tipografías: Cormorant Garamond (heading) + Manrope (body)

## Personas
- Viajeros curiosos buscando experiencias en grupos pequeños y guiados
- Guía/admin gestionando viajes, solicitudes, galería y testimonios

## Implementado (10/Feb/2026)
- Páginas públicas: Home, /viajes, /viajes/:id, /galeria, /sobre-mi, /contacto
- Panel admin: /admin/login, /admin con tabs Viajes / Reservas / Galería / Testimonios
- API REST `/api`: trips, gallery, testimonials, reservations + admin CRUD protegido
- Seeding automático: admin + 4 viajes demo + 6 fotos + 3 testimonios
- Filtro por país, formulario de reserva con WhatsApp CTA
- Toasts, navbar con scroll-aware, footer

## Backlog (P0 / P1 / P2)
- P1: Subida de imágenes (object storage) — actualmente solo URLs
- P1: Notificaciones email al admin cuando llega una reserva (Resend / SendGrid)
- P2: Pasarela de pagos opcional (Stripe) para anticipo de reserva
- P2: Brute-force lockout en login y validación enum de status de reserva
- P2: Newsletter / suscripción para próximas salidas
- P2: SEO (meta tags por viaje, sitemap)

## Test credentials
admin@viajes.mx / Aventura2026!
