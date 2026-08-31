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


def insert_meal(food_name: str, description: str, estimated_calories: int, confidence: str) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO meals (food_name, description, estimated_calories, confidence, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (food_name, description, estimated_calories, confidence, created_at),
        )
        meal_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()
        return row


def list_meals() -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute("SELECT * FROM meals ORDER BY created_at DESC").fetchall()
