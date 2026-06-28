from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# --- DB ---
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --- App ---
app = FastAPI(title="INFINITUR API")
api_router = APIRouter(prefix="/api")

# --- Object storage (Emergent) ---
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "infinitur-mx")
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif"}
_storage_key = None


def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        return _storage_key
    except Exception as e:
        logging.getLogger(__name__).error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage no inicializado")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if r.status_code == 403:
        global _storage_key
        _storage_key = None
        key = init_storage()
        r = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    r.raise_for_status()
    return r.json()


def get_object(path: str):
    key = init_storage()
    r = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

# --- JWT / auth helpers ---
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Token inválido")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Acceso denegado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


# --- Models ---
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class TripBase(BaseModel):
    title: str
    destination: str
    country: str  # "México", "América", "Europa"
    description: str
    long_description: Optional[str] = ""
    duration_days: int
    start_date: str  # ISO date string
    end_date: str
    price: float
    currency: str = "MXN"
    group_min: int = 10
    group_max: int = 15
    spots_left: int = 15
    cover_image: str
    images: List[str] = []
    itinerary: List[dict] = []  # [{day: 1, title, description}]
    included: List[str] = []
    excluded: List[str] = []
    featured: bool = False
    active: bool = True
    # New (per Figma briefing)
    trip_type: str = "Clásico"  # Clásico | Explora | Aventura | Bienestar | Mochilero | Confort | Alturismo
    region: str = "Nacional"  # Nacional | Internacional
    places: List[str] = []  # ["Maruata", "Palma Sola", ...]
    pricing_tiers: List[dict] = []  # [{label: "Campamento", price: 3900, icon: "tent"}]
    itinerary_pdf_url: Optional[str] = ""


class Trip(TripBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReservationInput(BaseModel):
    trip_id: str
    name: str
    email: EmailStr
    phone: str
    people: int = 1
    message: Optional[str] = ""


class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: str
    trip_title: Optional[str] = ""
    name: str
    email: str
    phone: str
    people: int
    message: str = ""
    status: str = "nuevo"  # nuevo | contactado | confirmado | cancelado
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class GalleryPhotoInput(BaseModel):
    url: str
    caption: Optional[str] = ""
    location: Optional[str] = ""


class GalleryPhoto(GalleryPhotoInput):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TestimonialInput(BaseModel):
    author: str
    location: Optional[str] = ""
    text: str
    rating: int = 5
    avatar: Optional[str] = ""


class Testimonial(TestimonialInput):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# --- Auth endpoints ---
@api_router.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=False,
        samesite="lax", max_age=43200, path="/",
    )
    return {"id": user["id"], "email": user["email"], "name": user.get("name"), "role": user["role"], "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_admin)):
    return user


# --- Public endpoints ---
@api_router.get("/trips", response_model=List[Trip])
async def list_trips(featured: Optional[bool] = None, country: Optional[str] = None):
    q = {"active": True}
    if featured is not None:
        q["featured"] = featured
    if country:
        q["country"] = country
    docs = await db.trips.find(q, {"_id": 0}).sort("start_date", 1).to_list(200)
    return docs


@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    doc = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Viaje no encontrado")
    return doc


@api_router.get("/gallery", response_model=List[GalleryPhoto])
async def list_gallery():
    docs = await db.gallery.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/testimonials", response_model=List[Testimonial])
async def list_testimonials():
    docs = await db.testimonials.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(data: ReservationInput):
    trip = await db.trips.find_one({"id": data.trip_id}, {"_id": 0})
    res = Reservation(
        trip_id=data.trip_id,
        trip_title=trip["title"] if trip else "",
        name=data.name,
        email=data.email,
        phone=data.phone,
        people=data.people,
        message=data.message or "",
    )
    await db.reservations.insert_one(res.model_dump())
    return res


# --- Admin endpoints (CRUD) ---
@api_router.post("/admin/trips", response_model=Trip)
async def admin_create_trip(data: TripBase, user: dict = Depends(get_current_admin)):
    trip = Trip(**data.model_dump())
    await db.trips.insert_one(trip.model_dump())
    return trip


@api_router.put("/admin/trips/{trip_id}", response_model=Trip)
async def admin_update_trip(trip_id: str, data: TripBase, user: dict = Depends(get_current_admin)):
    update = data.model_dump()
    res = await db.trips.update_one({"id": trip_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Viaje no encontrado")
    doc = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/trips/{trip_id}")
async def admin_delete_trip(trip_id: str, user: dict = Depends(get_current_admin)):
    res = await db.trips.delete_one({"id": trip_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Viaje no encontrado")
    return {"ok": True}


@api_router.get("/admin/trips", response_model=List[Trip])
async def admin_list_trips(user: dict = Depends(get_current_admin)):
    docs = await db.trips.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/admin/reservations", response_model=List[Reservation])
async def admin_list_reservations(user: dict = Depends(get_current_admin)):
    docs = await db.reservations.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.put("/admin/reservations/{rid}")
async def admin_update_reservation(rid: str, payload: dict, user: dict = Depends(get_current_admin)):
    allowed = {k: v for k, v in payload.items() if k in {"status"}}
    if not allowed:
        raise HTTPException(400, "Sin cambios válidos")
    res = await db.reservations.update_one({"id": rid}, {"$set": allowed})
    if res.matched_count == 0:
        raise HTTPException(404, "Reserva no encontrada")
    return {"ok": True}


@api_router.delete("/admin/reservations/{rid}")
async def admin_delete_reservation(rid: str, user: dict = Depends(get_current_admin)):
    await db.reservations.delete_one({"id": rid})
    return {"ok": True}


@api_router.post("/admin/gallery", response_model=GalleryPhoto)
async def admin_create_photo(data: GalleryPhotoInput, user: dict = Depends(get_current_admin)):
    photo = GalleryPhoto(**data.model_dump())
    await db.gallery.insert_one(photo.model_dump())
    return photo


@api_router.delete("/admin/gallery/{pid}")
async def admin_delete_photo(pid: str, user: dict = Depends(get_current_admin)):
    await db.gallery.delete_one({"id": pid})
    return {"ok": True}


@api_router.post("/admin/testimonials", response_model=Testimonial)
async def admin_create_testimonial(data: TestimonialInput, user: dict = Depends(get_current_admin)):
    t = Testimonial(**data.model_dump())
    await db.testimonials.insert_one(t.model_dump())
    return t


@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, user: dict = Depends(get_current_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}


@api_router.get("/")
async def root():
    return {"app": "INFINITUR", "status": "ok"}


# --- Videos (Facebook video URLs) ---
class VideoInput(BaseModel):
    fb_url: str
    title: Optional[str] = ""
    order: int = 0


class Video(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fb_url: str
    title: str = ""
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/videos", response_model=List[Video])
async def list_videos():
    docs = await db.videos.find({}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(50)
    return docs


@api_router.post("/admin/videos", response_model=Video)
async def admin_create_video(data: VideoInput, user: dict = Depends(get_current_admin)):
    v = Video(**data.model_dump())
    await db.videos.insert_one(v.model_dump())
    return v


@api_router.delete("/admin/videos/{vid}")
async def admin_delete_video(vid: str, user: dict = Depends(get_current_admin)):
    await db.videos.delete_one({"id": vid})
    return {"ok": True}


# --- Upload & file serving ---
@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), user: dict = Depends(get_current_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "bin").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(400, "Formato no permitido (usa jpg, png, webp, gif)")
    content_type = MIME_TYPES[ext]
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Archivo demasiado grande (máx 8MB)")
    result = put_object(path, data, content_type)
    file_id = str(uuid.uuid4())
    await db.files.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Build public URL using request scheme/host? Use a relative API path; frontend prefixes BACKEND_URL.
    public_url = f"/api/files/{file_id}"
    return {"id": file_id, "url": public_url}


@api_router.get("/files/{file_id}")
async def serve_file(file_id: str):
    record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Archivo no encontrado")
    data, ct = get_object(record["storage_path"])
    return Response(content=data, media_type=record.get("content_type", ct), headers={"Cache-Control": "public, max-age=86400"})


# --- FAQ ---
class FAQItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0


class FAQInput(BaseModel):
    question: str
    answer: str
    order: int = 0


@api_router.get("/faq", response_model=List[FAQItem])
async def list_faq():
    docs = await db.faq.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return docs


@api_router.post("/admin/faq", response_model=FAQItem)
async def admin_create_faq(data: FAQInput, user: dict = Depends(get_current_admin)):
    item = FAQItem(**data.model_dump())
    await db.faq.insert_one(item.model_dump())
    return item


@api_router.put("/admin/faq/{fid}", response_model=FAQItem)
async def admin_update_faq(fid: str, data: FAQInput, user: dict = Depends(get_current_admin)):
    res = await db.faq.update_one({"id": fid}, {"$set": data.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "FAQ no encontrado")
    doc = await db.faq.find_one({"id": fid}, {"_id": 0})
    return doc


@api_router.delete("/admin/faq/{fid}")
async def admin_delete_faq(fid: str, user: dict = Depends(get_current_admin)):
    await db.faq.delete_one({"id": fid})
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origin_regex=".*",
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# --- Seed admin & sample data ---
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": email,
            "password_hash": hash_password(password),
            "name": "Administrador",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin sembrado: {email}")
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})


async def seed_demo_data():
    """Orchestrates demo data seeding by delegating to small helpers."""
    await _seed_trips_if_empty()
    await _seed_gallery_if_empty()
    await _seed_testimonials_if_empty()


def _region_from_country(country: str) -> str:
    return "Nacional" if country == "México" else "Internacional"


async def _migrate_trip_fields():
    """Backfill new fields on legacy trips (trip_type, region, places, pricing_tiers)."""
    cursor = db.trips.find({}, {"_id": 0})
    async for t in cursor:
        update = {}
        if not t.get("trip_type"):
            update["trip_type"] = "Clásico"
        if not t.get("region"):
            update["region"] = _region_from_country(t.get("country", "México"))
        if "places" not in t or not t.get("places"):
            update["places"] = []
        if "pricing_tiers" not in t or not t.get("pricing_tiers"):
            base = float(t.get("price", 0))
            update["pricing_tiers"] = [
                {"label": "Cuádruple", "price": base, "icon": "bed"},
                {"label": "Triple", "price": round(base * 1.15), "icon": "bed"},
                {"label": "Doble", "price": round(base * 1.30), "icon": "bed"},
            ]
        if "itinerary_pdf_url" not in t:
            update["itinerary_pdf_url"] = ""
        if update:
            await db.trips.update_one({"id": t["id"]}, {"$set": update})


async def _seed_trips_if_empty():
    if await db.trips.count_documents({}) > 0:
        return
    sample_trips = [
            {
                "title": "Chichén Itzá y Cenotes Sagrados",
                "destination": "Yucatán, México",
                "country": "México",
                "description": "Tres días explorando la herencia maya: pirámides, cenotes turquesa y comida tradicional.",
                "long_description": "Un recorrido íntimo por uno de los lugares más mágicos del mundo. Visitaremos Chichén Itzá al amanecer para evitar multitudes, nadaremos en cenotes secretos, y compartiremos cochinita pibil hecha en horno de tierra con una familia local.",
                "duration_days": 3,
                "start_date": "2026-04-15",
                "end_date": "2026-04-17",
                "price": 8500,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 15,
                "spots_left": 12,
                "cover_image": "https://images.unsplash.com/photo-1606403759369-e10299ed5740",
                "images": [
                    "https://images.unsplash.com/photo-1606403759369-e10299ed5740",
                    "https://images.pexels.com/photos/6125816/pexels-photo-6125816.jpeg",
                ],
                "itinerary": [
                    {"day": 1, "title": "Llegada a Mérida", "description": "Recibimiento, paseo por el centro histórico y cena de bienvenida."},
                    {"day": 2, "title": "Chichén Itzá al amanecer", "description": "Tour guiado por las ruinas y baño en cenote Ik Kil."},
                    {"day": 3, "title": "Valladolid y regreso", "description": "Pueblo mágico, mercado y traslado al aeropuerto."},
                ],
                "included": ["Transporte privado", "Hospedaje 2 noches", "3 desayunos", "Guía certificado", "Entradas a sitios"],
                "excluded": ["Vuelos", "Bebidas alcohólicas", "Propinas"],
                "featured": True,
                "active": True,
            },
            {
                "title": "Machu Picchu y el Valle Sagrado",
                "destination": "Cusco, Perú",
                "country": "América",
                "description": "Una semana inolvidable por los Andes peruanos: Cusco, Valle Sagrado y la ciudadela de Machu Picchu.",
                "long_description": "Caminaremos rutas incas menos transitadas, dormiremos en hospedajes familiares de Ollantaytambo y llegaremos a Machu Picchu en tren panorámico. Un viaje pensado para conectar con la cultura y la naturaleza.",
                "duration_days": 7,
                "start_date": "2026-05-10",
                "end_date": "2026-05-16",
                "price": 32000,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 12,
                "spots_left": 8,
                "cover_image": "https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg",
                "images": ["https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg"],
                "itinerary": [
                    {"day": 1, "title": "Llegada a Cusco", "description": "Aclimatación y mate de coca."},
                    {"day": 3, "title": "Valle Sagrado", "description": "Pisac y Ollantaytambo."},
                    {"day": 5, "title": "Machu Picchu", "description": "Tour completo de la ciudadela."},
                ],
                "included": ["Hospedaje 6 noches", "Tren a Machu Picchu", "Guía bilingüe", "Desayunos"],
                "excluded": ["Vuelos internacionales", "Comidas no especificadas"],
                "featured": True,
                "active": True,
            },
            {
                "title": "París y la Provenza",
                "destination": "Francia",
                "country": "Europa",
                "description": "5 días entre cafés parisinos, museos icónicos y campos de lavanda en la Provenza.",
                "long_description": "Un viaje slow para grupos pequeños: caminatas guiadas por barrios poco turísticos de París, día completo en Versalles, y tres noches en una villa rural en la Provenza con visitas a mercados locales.",
                "duration_days": 5,
                "start_date": "2026-06-20",
                "end_date": "2026-06-24",
                "price": 45000,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 14,
                "spots_left": 14,
                "cover_image": "https://images.unsplash.com/photo-1570097703229-b195d6dd291f",
                "images": ["https://images.unsplash.com/photo-1570097703229-b195d6dd291f"],
                "itinerary": [
                    {"day": 1, "title": "Llegada a París", "description": "Caminata por el Sena al atardecer."},
                    {"day": 3, "title": "Versalles", "description": "Día completo en el palacio."},
                    {"day": 5, "title": "Provenza", "description": "Campos de lavanda y mercado."},
                ],
                "included": ["Hospedaje", "Guía local", "Tours privados"],
                "excluded": ["Vuelos", "Comidas no listadas"],
                "featured": False,
                "active": True,
            },
            {
                "title": "Pueblo Mágico de Tepoztlán",
                "destination": "Morelos, México",
                "country": "México",
                "description": "Escapada de fin de semana: cerro del Tepozteco, mercados y temazcal.",
                "long_description": "Una experiencia de un día perfecta para desconectarte: ascenso al Tepozteco al amanecer, almuerzo orgánico, paseo por el mercado de los domingos y temazcal ceremonial al atardecer.",
                "duration_days": 1,
                "start_date": "2026-03-22",
                "end_date": "2026-03-22",
                "price": 1800,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 15,
                "spots_left": 15,
                "cover_image": "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg",
                "images": ["https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg"],
                "itinerary": [
                    {"day": 1, "title": "Tepoztlán completo", "description": "Cerro al amanecer, mercado y temazcal."},
                ],
                "included": ["Transporte ida y vuelta CDMX", "Guía", "Temazcal", "Almuerzo"],
                "excluded": ["Bebidas extra"],
                "featured": True,
                "active": True,
            },
            {
                "title": "Oaxaca Mágico: Mezcal, Mole y Monte Albán",
                "destination": "Oaxaca, México",
                "country": "México",
                "description": "4 días de sabores, colores y tradición zapoteca. Tianguis, mezcalerías artesanales y ruinas.",
                "long_description": "Vamos a perdernos entre callejones de la ciudad de Oaxaca, subir a Monte Albán al amanecer, comer en mercados con cocineras tradicionales y catar mezcales en palenques familiares de los Valles Centrales.",
                "duration_days": 4,
                "start_date": "2026-07-18",
                "end_date": "2026-07-21",
                "price": 11500,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 15,
                "spots_left": 11,
                "cover_image": "https://images.unsplash.com/photo-1518614368389-a91ff4a47550?w=1200",
                "images": ["https://images.unsplash.com/photo-1518614368389-a91ff4a47550?w=1200"],
                "itinerary": [
                    {"day": 1, "title": "Llegada y centro histórico", "description": "Caminata por el zócalo y cena de bienvenida."},
                    {"day": 2, "title": "Monte Albán", "description": "Visita arqueológica al amanecer."},
                    {"day": 3, "title": "Valles Centrales", "description": "Mitla, Teotitlán y palenque mezcalero."},
                    {"day": 4, "title": "Mercado y despedida", "description": "Mercado 20 de Noviembre y traslado."},
                ],
                "included": ["Hospedaje 3 noches", "Transporte interno", "Cata de mezcal", "3 desayunos", "Guía"],
                "excluded": ["Vuelos", "Comidas no listadas"],
                "featured": True,
                "active": True,
            },
            {
                "title": "Cartagena y el Caribe Colombiano",
                "destination": "Cartagena, Colombia",
                "country": "América",
                "description": "5 días entre murallas coloniales, playas de Islas del Rosario y noches de cumbia.",
                "long_description": "Cartagena de Indias es pura magia caribeña. Caminamos sus calles empedradas, navegamos a islas paradisíacas, comemos arepas de huevo en la calle y bailamos cumbia hasta que el sol nos cache.",
                "duration_days": 5,
                "start_date": "2026-08-12",
                "end_date": "2026-08-16",
                "price": 28500,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 14,
                "spots_left": 14,
                "cover_image": "https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=1200",
                "images": ["https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=1200"],
                "itinerary": [
                    {"day": 1, "title": "Llegada a Cartagena", "description": "Tour por la ciudad amurallada."},
                    {"day": 3, "title": "Islas del Rosario", "description": "Día completo de playa y snorkel."},
                    {"day": 5, "title": "Getsemaní y despedida", "description": "Caminata por el barrio bohemio."},
                ],
                "included": ["Hospedaje 4 noches", "Tour islas", "Guía local", "Desayunos"],
                "excluded": ["Vuelos internacionales"],
                "featured": False,
                "active": True,
            },
            {
                "title": "Roma, Florencia y la Toscana",
                "destination": "Italia",
                "country": "Europa",
                "description": "Una semana saboreando Italia: arte renacentista, pasta auténtica y atardeceres entre viñedos.",
                "long_description": "De Roma a Florencia con una escapada de 3 días por la Toscana rural. Visitas guiadas por museos, tour de pasta artesanal, y degustación de vinos en una bodega familiar.",
                "duration_days": 7,
                "start_date": "2026-09-22",
                "end_date": "2026-09-28",
                "price": 58000,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 12,
                "spots_left": 10,
                "cover_image": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200",
                "images": ["https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200"],
                "itinerary": [
                    {"day": 1, "title": "Llegada a Roma", "description": "Cena en Trastevere."},
                    {"day": 3, "title": "Coliseo y Vaticano", "description": "Tours guiados sin filas."},
                    {"day": 5, "title": "Toscana", "description": "Bodega y clase de cocina."},
                ],
                "included": ["Hospedaje 6 noches", "Tours guiados", "Clase de pasta", "Cata de vinos"],
                "excluded": ["Vuelos internacionales", "Comidas no listadas"],
                "featured": True,
                "active": True,
            },
            {
                "title": "Cañón del Sumidero y Chiapas Profundo",
                "destination": "Chiapas, México",
                "country": "México",
                "description": "5 días entre selvas, cascadas turquesa y comunidades tsotsiles. San Cristóbal, Palenque y más.",
                "long_description": "Recorrido por uno de los estados más diversos de México. Navegamos el Cañón del Sumidero, exploramos las ruinas mayas de Palenque selva adentro, nos perdemos en San Cristóbal de las Casas y nadamos en las cascadas de Agua Azul.",
                "duration_days": 5,
                "start_date": "2026-10-08",
                "end_date": "2026-10-12",
                "price": 14500,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 15,
                "spots_left": 15,
                "cover_image": "https://images.unsplash.com/photo-1568659585041-3a3905e1aa0c?w=1200",
                "images": ["https://images.unsplash.com/photo-1568659585041-3a3905e1aa0c?w=1200"],
                "itinerary": [
                    {"day": 1, "title": "Llegada a Tuxtla", "description": "Cañón del Sumidero en lancha."},
                    {"day": 3, "title": "San Cristóbal", "description": "Pueblos tsotsiles y mercado."},
                    {"day": 5, "title": "Palenque", "description": "Ruinas mayas y cascadas."},
                ],
                "included": ["Transporte interno", "Hospedaje 4 noches", "Guía local", "Entradas"],
                "excluded": ["Vuelos", "Bebidas alcohólicas"],
                "featured": False,
                "active": True,
            },
            {
                "title": "Buenos Aires, Mendoza y Patagonia",
                "destination": "Argentina",
                "country": "América",
                "description": "10 días por lo mejor de Argentina: tango, malbec en Mendoza y glaciares en El Calafate.",
                "long_description": "El viaje más completo a Argentina: arrancamos en Buenos Aires con una milonga inolvidable, volamos a Mendoza para catar vinos al pie de los Andes, y terminamos frente al Perito Moreno en la Patagonia.",
                "duration_days": 10,
                "start_date": "2026-11-05",
                "end_date": "2026-11-14",
                "price": 62000,
                "currency": "MXN",
                "group_min": 10,
                "group_max": 12,
                "spots_left": 9,
                "cover_image": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200",
                "images": ["https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200"],
                "itinerary": [
                    {"day": 1, "title": "Llegada Buenos Aires", "description": "Tour San Telmo y milonga."},
                    {"day": 4, "title": "Mendoza", "description": "Cata de Malbec en 3 bodegas."},
                    {"day": 8, "title": "El Calafate", "description": "Glaciar Perito Moreno."},
                ],
                "included": ["Vuelos internos", "Hospedaje 9 noches", "Guías", "Catas"],
                "excluded": ["Vuelos internacionales"],
                "featured": False,
                "active": True,
            },
        ]
    for t in sample_trips:
        doc = Trip(**t).model_dump()
        await db.trips.insert_one(doc)
    logger.info("Viajes demo sembrados")


async def _seed_gallery_if_empty():
    if await db.gallery.count_documents({}) > 0:
        return
    photos = [
            {"url": "https://images.pexels.com/photos/6125816/pexels-photo-6125816.jpeg?w=1000", "caption": "Atardecer en la sierra", "location": "México"},
            {"url": "https://images.unsplash.com/photo-1629752123286-49a7f60571f3?w=1000", "caption": "Caminata grupal", "location": "Andes"},
            {"url": "https://images.unsplash.com/photo-1521437687640-34c398f4e598?w=1000", "caption": "Cumbre conquistada", "location": "Perú"},
            {"url": "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg?w=1000", "caption": "Abrazo de grupo", "location": "Tepoztlán"},
            {"url": "https://images.unsplash.com/photo-1606403759369-e10299ed5740?w=1000", "caption": "Pirámides al amanecer", "location": "Yucatán"},
            {"url": "https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg?w=1000", "caption": "Machu Picchu mágico", "location": "Cusco"},
            {"url": "https://images.unsplash.com/photo-1518614368389-a91ff4a47550?w=1000", "caption": "Colores de Oaxaca", "location": "Oaxaca"},
            {"url": "https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=1000", "caption": "Murallas de Cartagena", "location": "Colombia"},
            {"url": "https://images.unsplash.com/photo-1568659585041-3a3905e1aa0c?w=1000", "caption": "Selva chiapaneca", "location": "Chiapas"},
            {"url": "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1000", "caption": "Trajineras en Xochimilco", "location": "CDMX"},
            {"url": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1000", "caption": "Mercado de artesanías", "location": "México"},
            {"url": "https://images.unsplash.com/photo-1565073624497-7e91b5cc3843?w=1000", "caption": "Playas escondidas", "location": "Oaxaca"},
    ]
    for p in photos:
        doc = GalleryPhoto(**p).model_dump()
        await db.gallery.insert_one(doc)


async def _seed_testimonials_if_empty():
    if await db.testimonials.count_documents({}) > 0:
        return
    items = [
            {"author": "María Fernanda", "location": "CDMX", "text": "El viaje a Yucatán superó todas mis expectativas. Diego conoce cada rincón y nos hizo sentir como familia.", "rating": 5, "avatar": ""},
            {"author": "Roberto Sánchez", "location": "Guadalajara", "text": "Perú con este grupo fue mágico. Todo perfectamente organizado y sin estrés. Volvería sin dudarlo.", "rating": 5, "avatar": ""},
            {"author": "Lucía Ortega", "location": "Monterrey", "text": "Lo que más me gustó fue la calidad humana. Grupos pequeños hacen toda la diferencia.", "rating": 5, "avatar": ""},
    ]
    for i in items:
        doc = Testimonial(**i).model_dump()
        await db.testimonials.insert_one(doc)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.trips.create_index("id", unique=True)
    await db.reservations.create_index("id", unique=True)
    init_storage()
    await seed_admin()
    await seed_demo_data()
    await seed_faq()
    await _migrate_trip_fields()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


async def seed_faq():
    if await db.faq.count_documents({}) > 0:
        return
    items = [
        ("¿Cómo reservo mi lugar?", "Llena el formulario de reserva del viaje que te guste. Te contactamos en menos de 24 horas para confirmar disponibilidad y enviarte la información de pago."),
        ("¿Cuál es la forma de pago?", "Aceptamos transferencia bancaria, depósito y SPEI dentro de México. Para viajes internacionales también aceptamos PayPal. Confirmas con el 50% de anticipo y el resto 30 días antes del viaje."),
        ("¿Qué incluyen los viajes?", "Generalmente incluyen hospedaje, transporte interno, guía certificado, entradas a sitios y algunos alimentos. Cada viaje tiene un detalle de qué incluye y qué no — revísalo en la página del viaje."),
        ("¿De cuántas personas son los grupos?", "Grupos chicos de 10 a 15 personas máximo. Esto nos permite movernos con flexibilidad, conocer a todos por su nombre y entrar a lugares que no aceptan grupos grandes."),
        ("¿Puedo viajar solo/a?", "¡Por supuesto! Más de la mitad de quienes viajan con nosotros llegan solos. Es la mejor forma de hacer amigos viajeros."),
        ("¿Qué pasa si tengo que cancelar?", "Hasta 30 días antes del viaje devolvemos el 100% del anticipo. Entre 15 y 30 días, el 50%. Menos de 15 días no podemos devolver, pero puedes transferir tu lugar a otra persona."),
        ("¿Necesito seguro de viaje?", "Recomendamos fuertemente contratar un seguro de viaje, sobre todo para viajes internacionales. Te podemos sugerir opciones confiables al confirmar tu reserva."),
        ("¿Hacen viajes a la medida para grupos privados?", "Sí. Si tu grupo de amigos, familia o empresa quiere un viaje exclusivo, escríbenos por WhatsApp y armamos algo a tu medida."),
    ]
    for i, (q, a) in enumerate(items):
        item = FAQItem(question=q, answer=a, order=i)
        await db.faq.insert_one(item.model_dump())
