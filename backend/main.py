from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import db
from cohere_client import CohereEstimationError, estimate_calories

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(title="AI-Powered Calorie Tracker API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _row_to_meal(row) -> dict:
    return {
        "id": row["id"],
        "food_name": row["food_name"],
        "description": row["description"],
        "estimated_calories": row["estimated_calories"],
        "confidence": row["confidence"],
        "created_at": row["created_at"],
    }


@app.post("/api/meals/estimate")
async def estimate_meal(image: UploadFile) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        result = estimate_calories(image_bytes, image.content_type)
    except CohereEstimationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    row = db.insert_meal(
        food_name=result["food_name"],
        description=result["description"],
        estimated_calories=int(result["estimated_calories"]),
        confidence=result["confidence"],
    )
    return _row_to_meal(row)


@app.get("/api/meals")
def get_meals() -> list[dict]:
    return [_row_to_meal(row) for row in db.list_meals()]
