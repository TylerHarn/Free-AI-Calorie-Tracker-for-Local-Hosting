import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "meals.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS meals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                food_name TEXT NOT NULL,
                description TEXT NOT NULL,
                estimated_calories INTEGER NOT NULL,
                confidence TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sex TEXT,
                age INTEGER,
                height_cm REAL,
                weight_kg REAL,
                activity_level TEXT,
                weekly_loss_rate_lb REAL,
                daily_calorie_goal INTEGER,
                created_at TEXT NOT NULL
            )
            """
        )

        # meals predates the users table; add the column if it's not there yet.
        existing_columns = {row["name"] for row in conn.execute("PRAGMA table_info(meals)")}
        if "user_id" not in existing_columns:
            conn.execute("ALTER TABLE meals ADD COLUMN user_id INTEGER")


def create_user(name: str) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO users (name, created_at) VALUES (?, ?)",
            (name, created_at),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()


def get_user(user_id: int) -> sqlite3.Row | None:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def list_users() -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM users ORDER BY created_at ASC").fetchall()


def save_setup(
    user_id: int,
    sex: str,
    age: int,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    weekly_loss_rate_lb: float,
    daily_calorie_goal: int,
) -> sqlite3.Row:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE users
            SET sex = ?, age = ?, height_cm = ?, weight_kg = ?, activity_level = ?,
                weekly_loss_rate_lb = ?, daily_calorie_goal = ?
            WHERE id = ?
            """,
            (sex, age, height_cm, weight_kg, activity_level, weekly_loss_rate_lb, daily_calorie_goal, user_id),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def insert_meal(
    user_id: int, food_name: str, description: str, estimated_calories: int, confidence: str
) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO meals (user_id, food_name, description, estimated_calories, confidence, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, food_name, description, estimated_calories, confidence, created_at),
        )
        meal_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()
        return row


def list_meals(user_id: int) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM meals WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()


def update_meal_calories(meal_id: int, user_id: int, estimated_calories: int) -> sqlite3.Row | None:
    with get_connection() as conn:
        cursor = conn.execute(
            "UPDATE meals SET estimated_calories = ? WHERE id = ? AND user_id = ?",
            (estimated_calories, meal_id, user_id),
        )
        if cursor.rowcount == 0:
            return None
        return conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()


def delete_meal(meal_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM meals WHERE id = ? AND user_id = ?", (meal_id, user_id))
        return cursor.rowcount > 0
