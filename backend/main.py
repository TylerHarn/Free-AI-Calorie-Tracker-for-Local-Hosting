from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import db
from calorie_calc import (
    compute_daily_calorie_goal,
    estimate_workout_calories,
    ft_in_to_cm,
    lb_to_kg,
    list_activities,
)
from cohere_client import CohereEstimationError, estimate_calories

load_dotenv()

USER_COOKIE = "user_id"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365  # 1 year — this app has no password, so "signed in" should stick


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


def _row_to_workout(row) -> dict:
    return {
        "id": row["id"],
        "activity_name": row["activity_name"],
        "calories_burned": row["calories_burned"],
        "created_at": row["created_at"],
    }


def _row_to_user(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "sex": row["sex"],
        "age": row["age"],
        "height_cm": row["height_cm"],
        "weight_kg": row["weight_kg"],
        "activity_level": row["activity_level"],
        "weekly_loss_rate_lb": row["weekly_loss_rate_lb"],
        "daily_calorie_goal": row["daily_calorie_goal"],
    }


def get_current_user(user_id: int | None = Cookie(default=None)):
    if user_id is None:
        raise HTTPException(status_code=401, detail="No active user. Sign in first.")
    row = db.get_user(user_id)
    if row is None:
        raise HTTPException(status_code=401, detail="Active user no longer exists.")
    return row


@app.get("/api/users")
def get_users() -> list[dict]:
    return [
        {"id": row["id"], "name": row["name"], "setup_complete": row["daily_calorie_goal"] is not None}
        for row in db.list_users()
    ]


class CreateUserRequest(BaseModel):
    name: str


@app.post("/api/users")
def create_user(body: CreateUserRequest, response: Response) -> dict:
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")
    row = db.create_user(name)
    response.set_cookie(USER_COOKIE, str(row["id"]), httponly=True, samesite="lax", max_age=COOKIE_MAX_AGE)
    return _row_to_user(row)


class SelectUserRequest(BaseModel):
    user_id: int


@app.post("/api/auth/select")
def select_user(body: SelectUserRequest, response: Response) -> dict:
    row = db.get_user(body.user_id)
    if row is None:
        raise HTTPException(status_code=404, detail="No such user.")
    response.set_cookie(USER_COOKIE, str(row["id"]), httponly=True, samesite="lax", max_age=COOKIE_MAX_AGE)
    return _row_to_user(row)


@app.post("/api/auth/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(USER_COOKIE)
    return {"ok": True}


@app.get("/api/auth/me")
def get_me(current_user=Depends(get_current_user)) -> dict:
    return _row_to_user(current_user)


class SetupRequest(BaseModel):
    sex: str
    age: int
    height_ft: int
    height_in: float
    weight_lb: float
    activity_level: str
    weekly_loss_rate_lb: float


@app.post("/api/users/me/setup")
def setup_user(body: SetupRequest, current_user=Depends(get_current_user)) -> dict:
    height_cm = ft_in_to_cm(body.height_ft, body.height_in)
    weight_kg = lb_to_kg(body.weight_lb)

    try:
        goal = compute_daily_calorie_goal(
            sex=body.sex,
            age=body.age,
            height_cm=height_cm,
            weight_kg=weight_kg,
            activity_level=body.activity_level,
            weekly_loss_rate_lb=body.weekly_loss_rate_lb,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    row = db.save_setup(
        user_id=current_user["id"],
        sex=body.sex,
        age=body.age,
        height_cm=height_cm,
        weight_kg=weight_kg,
        activity_level=body.activity_level,
        weekly_loss_rate_lb=body.weekly_loss_rate_lb,
        daily_calorie_goal=goal,
    )
    return _row_to_user(row)


@app.post("/api/meals/estimate")
async def estimate_meal(image: UploadFile, current_user=Depends(get_current_user)) -> dict:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        result = estimate_calories(image_bytes, image.content_type)
    except CohereEstimationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return {
        "food_name": result["food_name"],
        "description": result["description"],
        "estimated_calories": int(result["estimated_calories"]),
        "confidence": result["confidence"],
    }


class MealEntryRequest(BaseModel):
    food_name: str
    description: str
    estimated_calories: int
    confidence: str


@app.post("/api/meals")
def add_meal(body: MealEntryRequest, current_user=Depends(get_current_user)) -> dict:
    row = db.insert_meal(
        user_id=current_user["id"],
        food_name=body.food_name,
        description=body.description,
        estimated_calories=body.estimated_calories,
        confidence=body.confidence,
    )
    return _row_to_meal(row)


class UpdateMealRequest(BaseModel):
    estimated_calories: int


@app.patch("/api/meals/{meal_id}")
def update_meal(meal_id: int, body: UpdateMealRequest, current_user=Depends(get_current_user)) -> dict:
    row = db.update_meal_calories(meal_id, current_user["id"], body.estimated_calories)
    if row is None:
        raise HTTPException(status_code=404, detail="No such meal.")
    return _row_to_meal(row)


@app.delete("/api/meals/{meal_id}")
def remove_meal(meal_id: int, current_user=Depends(get_current_user)) -> dict:
    deleted = db.delete_meal(meal_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="No such meal.")
    return {"ok": True}


@app.get("/api/meals")
def get_meals(current_user=Depends(get_current_user)) -> list[dict]:
    return [_row_to_meal(row) for row in db.list_meals(current_user["id"])]


@app.get("/api/workouts/activities")
def get_activities() -> list[dict]:
    return list_activities()


class WorkoutEstimateRequest(BaseModel):
    activity: str
    duration_minutes: float


@app.post("/api/workouts/estimate")
def estimate_workout(body: WorkoutEstimateRequest, current_user=Depends(get_current_user)) -> dict:
    if current_user["weight_kg"] is None:
        raise HTTPException(status_code=400, detail="Complete setup first so we know your weight.")

    try:
        return estimate_workout_calories(body.activity, body.duration_minutes, current_user["weight_kg"])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


class WorkoutEntryRequest(BaseModel):
    activity_name: str
    calories_burned: int


@app.post("/api/workouts")
def add_workout(body: WorkoutEntryRequest, current_user=Depends(get_current_user)) -> dict:
    row = db.insert_workout(
        user_id=current_user["id"],
        activity_name=body.activity_name,
        calories_burned=body.calories_burned,
    )
    return _row_to_workout(row)


class UpdateWorkoutRequest(BaseModel):
    calories_burned: int


@app.patch("/api/workouts/{workout_id}")
def update_workout(workout_id: int, body: UpdateWorkoutRequest, current_user=Depends(get_current_user)) -> dict:
    row = db.update_workout_calories(workout_id, current_user["id"], body.calories_burned)
    if row is None:
        raise HTTPException(status_code=404, detail="No such workout.")
    return _row_to_workout(row)


@app.delete("/api/workouts/{workout_id}")
def remove_workout(workout_id: int, current_user=Depends(get_current_user)) -> dict:
    deleted = db.delete_workout(workout_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="No such workout.")
    return {"ok": True}


@app.get("/api/workouts")
def get_workouts(current_user=Depends(get_current_user)) -> list[dict]:
    return [_row_to_workout(row) for row in db.list_workouts(current_user["id"])]
