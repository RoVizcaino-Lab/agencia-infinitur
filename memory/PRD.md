# PRD — Senderos Auténticos (Agencia de viajes)

## Original problem statement
Sitio web con front + panel de admin para una agencia de viajes pequeña tipo freelance. Un guía organiza grupos de 10-15 personas para destinos en México, América y Europa. Duración: 1 día a 1 semana.

## User choices
- Funciones públicas completas, admin completo, sin pagos online, JWT custom admin, estilo cálido/aventurero
- Iteración 2: WhatsApp flotante, carrusel de meses, embed Facebook, slogan "¡El Viaje de los Viajes!", paleta naranja vibrante estilo Vagando por México
- Iteración 3: subida de imágenes desde admin, más viajes/galería demo, FAQ + admin FAQ

## Architecture
- Backend: FastAPI + MongoDB (motor) + bcrypt + PyJWT + Emergent object storage
- Frontend: React + Tailwind + shadcn UI + sonner toasts + react-router
- Auth: Bearer token (localStorage `admin_token`)
- Idiomas: ES; tipografías: Fraunces/Cormorant (heading) + Manrope (body)

## Implementado
**Iter 1 (10/Feb)**
- Páginas públicas: Home, /viajes, /viajes/:id, /galeria, /sobre-mi, /contacto
- Panel admin: /admin/login, /admin con tabs Viajes/Reservas/Galería/Testimonios
- Seeding admin + 4 viajes + 6 fotos + 3 testimonios

**Iter 2 (15/Feb)**
- Botón flotante WhatsApp (con burbuja "¿Tienes dudas?")
- Carrusel de 12 meses → enlaza a /viajes?mes=N
- Embed Facebook Page Plugin
- Nuevo slogan "¡El Viaje de los Viajes!"
- Paleta naranja vibrante (#FF6B2C) + amarillo sol (#FFB627)

**Iter 3 (25/May)**
- Subida de imágenes en admin (Emergent object storage) — endpoint /api/admin/upload + /api/files/:id
- Componente ImageUploadField reutilizable en AdminTrips y AdminGallery
- 9 viajes demo (Oaxaca, Cartagena, Italia, Chiapas, Argentina + originales)
- 12 fotos de galería más vibrantes
- Página /faq con acordeón + sección de WhatsApp CTA
- Admin tab FAQ con CRUD completo (8 preguntas sembradas)
- Bug fix: WhatsApp button ahora dentro de PublicShell
- 27/27 backend tests passed

## Backlog (P1 / P2)
- P1: Notificaciones por email al admin cuando entra una reserva (Resend/SendGrid)
- P1: Newsletter/suscripción desde el footer
- P2: Stripe para anticipo opcional
- P2: Brute-force lockout en login, enum validation en status, max_length en FAQ
- P2: Reemplazar input date nativo por shadcn Calendar en AdminTrips
- P2: Cachear /api/files/:id (CDN o redirect) — actualmente refetch cada request
- P2: Reemplazar Facebook iframe placeholder por URL real cuando el usuario la provea
- P2: SEO meta tags + sitemap

## Test credentials
admin@viajes.mx / Aventura2026!
