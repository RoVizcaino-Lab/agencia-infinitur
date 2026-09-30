"""Diagnóstico de archivos subidos (imágenes y PDFs).

Revisa todos los viajes (activos e inactivos), la galería y los testimonios,
busca referencias a /api/files/<id> y reporta el estado de cada una:

  OK        -> archivo guardado en el volumen
  LEGACY    -> sigue en Emergent; se copia al volumen en el primer acceso (o con --migrate)
  FALTA     -> el registro dice "local" pero el archivo no está en disco
  SIN REG   -> no existe registro en db.files

Uso (con las variables del backend, p. ej. dentro de Railway: `railway ssh`):
    python scripts/diagnose_files.py            # solo lectura
    python scripts/diagnose_files.py --migrate  # además copia al volumen los LEGACY
"""
import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from server import db, get_object, migrate_legacy_file, UPLOAD_DIR  # noqa: E402

FILE_RE = re.compile(r"/api/files/([0-9a-fA-F-]{36})")


def find_refs(value, field=""):
    if isinstance(value, str):
        for m in FILE_RE.finditer(value):
            yield field, m.group(1)
    elif isinstance(value, list):
        for i, v in enumerate(value):
            yield from find_refs(v, f"{field}[{i}]")
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from find_refs(v, f"{field}.{k}" if field else k)


async def main(migrate: bool):
    print(f"UPLOAD_DIR = {UPLOAD_DIR}\n")
    sources = [
        ("Viaje", db.trips, lambda d: f"{d.get('title')}{'' if d.get('active', True) else ' (inactivo)'}"),
        ("Galería", db.gallery, lambda d: d.get("caption") or d.get("id")),
        ("Testimonio", db.testimonials, lambda d: d.get("author")),
    ]
    counts = {}
    for kind, coll, label in sources:
        async for doc in coll.find({}, {"_id": 0}):
            for field, file_id in find_refs(doc):
                rec = await db.files.find_one({"id": file_id}, {"_id": 0})
                if not rec:
                    status = "SIN REG"
                elif rec.get("storage") == "local":
                    status = "OK" if get_object(rec["storage_path"]) else "FALTA"
                elif migrate:
                    status = "MIGRADO" if await migrate_legacy_file(rec) else "LEGACY (falló)"
                else:
                    status = "LEGACY"
                counts[status] = counts.get(status, 0) + 1
                name = (rec or {}).get("original_filename", "")
                print(f"{status:<15} | {kind}: {label(doc)} | {field} | {file_id} {name}")
    print("\nResumen:", ", ".join(f"{k}: {v}" for k, v in counts.items()) or "sin archivos subidos")


if __name__ == "__main__":
    asyncio.run(main("--migrate" in sys.argv))
