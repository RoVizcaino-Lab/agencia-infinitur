from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# --- DB ---
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# --- App ---
app = FastAPI(title="Senderos Auténticos API")
api_router = APIRouter(prefix="/api")

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
    return {"app": "Senderos Auténticos", "status": "ok"}


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
    if await db.trips.count_documents({}) == 0:
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
        ]
        for t in sample_trips:
            doc = Trip(**t).model_dump()
            await db.trips.insert_one(doc)
        logger.info("Viajes demo sembrados")

    if await db.gallery.count_documents({}) == 0:
        photos = [
            {"url": "https://images.pexels.com/photos/6125816/pexels-photo-6125816.jpeg", "caption": "Atardecer en la sierra", "location": "México"},
            {"url": "https://images.unsplash.com/photo-1629752123286-49a7f60571f3", "caption": "Caminata grupal", "location": "Andes"},
            {"url": "https://images.unsplash.com/photo-1521437687640-34c398f4e598", "caption": "Cumbre conquistada", "location": "Perú"},
            {"url": "https://images.pexels.com/photos/8696263/pexels-photo-8696263.jpeg", "caption": "Abrazo de grupo", "location": "Tepoztlán"},
            {"url": "https://images.unsplash.com/photo-1606403759369-e10299ed5740", "caption": "Pirámides al amanecer", "location": "Yucatán"},
            {"url": "https://images.pexels.com/photos/18662531/pexels-photo-18662531.jpeg", "caption": "Machu Picchu mágico", "location": "Cusco"},
        ]
        for p in photos:
            doc = GalleryPhoto(**p).model_dump()
            await db.gallery.insert_one(doc)

    if await db.testimonials.count_documents({}) == 0:
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
    await seed_admin()
    await seed_demo_data()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
