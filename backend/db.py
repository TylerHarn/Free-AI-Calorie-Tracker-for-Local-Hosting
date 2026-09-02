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

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                activity_name TEXT NOT NULL,
                calories_burned INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS weigh_ins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                weight_lb REAL NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                food_name TEXT NOT NULL,
                description TEXT NOT NULL,
                estimated_calories INTEGER NOT NULL,
                confidence TEXT NOT NULL,
                protein_g REAL NOT NULL DEFAULT 0,
                carbs_g REAL NOT NULL DEFAULT 0,
                fat_g REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """
        )

        # meals predates the users table and the macro columns; add whichever are missing.
        existing_columns = {row["name"] for row in conn.execute("PRAGMA table_info(meals)")}
        if "user_id" not in existing_columns:
            conn.execute("ALTER TABLE meals ADD COLUMN user_id INTEGER")
        for macro_column in ("protein_g", "carbs_g", "fat_g"):
            if macro_column not in existing_columns:
                conn.execute(f"ALTER TABLE meals ADD COLUMN {macro_column} REAL NOT NULL DEFAULT 0")

        # users predates goal_weight_lb.
        existing_user_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)")}
        if "goal_weight_lb" not in existing_user_columns:
            conn.execute("ALTER TABLE users ADD COLUMN goal_weight_lb REAL")


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
    goal_weight_lb: float | None = None,
) -> sqlite3.Row:
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE users
            SET sex = ?, age = ?, height_cm = ?, weight_kg = ?, activity_level = ?,
                weekly_loss_rate_lb = ?, daily_calorie_goal = ?, goal_weight_lb = ?
            WHERE id = ?
            """,
            (
                sex,
                age,
                height_cm,
                weight_kg,
                activity_level,
                weekly_loss_rate_lb,
                daily_calorie_goal,
                goal_weight_lb,
                user_id,
            ),
        )
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def insert_meal(
    user_id: int,
    food_name: str,
    description: str,
    estimated_calories: int,
    confidence: str,
    protein_g: float = 0,
    carbs_g: float = 0,
    fat_g: float = 0,
) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO meals
                (user_id, food_name, description, estimated_calories, confidence, protein_g, carbs_g, fat_g, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, food_name, description, estimated_calories, confidence, protein_g, carbs_g, fat_g, created_at),
        )
        meal_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()
        return row


def list_meals(user_id: int) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM meals WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()


UPDATABLE_MEAL_FIELDS = {"estimated_calories", "protein_g", "carbs_g", "fat_g"}


def update_meal(meal_id: int, user_id: int, **fields) -> sqlite3.Row | None:
    fields = {key: value for key, value in fields.items() if value is not None}
    unknown = set(fields) - UPDATABLE_MEAL_FIELDS
    if unknown:
        raise ValueError(f"Cannot update fields: {unknown}")
    if not fields:
        return get_meal(meal_id, user_id)

    set_clause = ", ".join(f"{key} = ?" for key in fields)
    with get_connection() as conn:
        cursor = conn.execute(
            f"UPDATE meals SET {set_clause} WHERE id = ? AND user_id = ?",
            (*fields.values(), meal_id, user_id),
        )
        if cursor.rowcount == 0:
            return None
        return conn.execute("SELECT * FROM meals WHERE id = ?", (meal_id,)).fetchone()


def get_meal(meal_id: int, user_id: int) -> sqlite3.Row | None:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM meals WHERE id = ? AND user_id = ?", (meal_id, user_id)
        ).fetchone()


def delete_meal(meal_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM meals WHERE id = ? AND user_id = ?", (meal_id, user_id))
        return cursor.rowcount > 0


def insert_workout(user_id: int, activity_name: str, calories_burned: int) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO workouts (user_id, activity_name, calories_burned, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, activity_name, calories_burned, created_at),
        )
        return conn.execute("SELECT * FROM workouts WHERE id = ?", (cursor.lastrowid,)).fetchone()


def list_workouts(user_id: int) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()


def update_workout_calories(workout_id: int, user_id: int, calories_burned: int) -> sqlite3.Row | None:
    with get_connection() as conn:
        cursor = conn.execute(
            "UPDATE workouts SET calories_burned = ? WHERE id = ? AND user_id = ?",
            (calories_burned, workout_id, user_id),
        )
        if cursor.rowcount == 0:
            return None
        return conn.execute("SELECT * FROM workouts WHERE id = ?", (workout_id,)).fetchone()


def delete_workout(workout_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM workouts WHERE id = ? AND user_id = ?", (workout_id, user_id))
        return cursor.rowcount > 0


def insert_weigh_in(user_id: int, weight_lb: float) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO weigh_ins (user_id, weight_lb, created_at) VALUES (?, ?, ?)",
            (user_id, weight_lb, created_at),
        )
        return conn.execute("SELECT * FROM weigh_ins WHERE id = ?", (cursor.lastrowid,)).fetchone()


def list_weigh_ins(user_id: int) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM weigh_ins WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()


def update_weigh_in(weigh_in_id: int, user_id: int, weight_lb: float) -> sqlite3.Row | None:
    with get_connection() as conn:
        cursor = conn.execute(
            "UPDATE weigh_ins SET weight_lb = ? WHERE id = ? AND user_id = ?",
            (weight_lb, weigh_in_id, user_id),
        )
        if cursor.rowcount == 0:
            return None
        return conn.execute("SELECT * FROM weigh_ins WHERE id = ?", (weigh_in_id,)).fetchone()


def delete_weigh_in(weigh_in_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM weigh_ins WHERE id = ? AND user_id = ?", (weigh_in_id, user_id))
        return cursor.rowcount > 0


def insert_favorite(
    user_id: int,
    food_name: str,
    description: str,
    estimated_calories: int,
    confidence: str,
    protein_g: float = 0,
    carbs_g: float = 0,
    fat_g: float = 0,
) -> sqlite3.Row:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO favorites
                (user_id, food_name, description, estimated_calories, confidence, protein_g, carbs_g, fat_g, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, food_name, description, estimated_calories, confidence, protein_g, carbs_g, fat_g, created_at),
        )
        return conn.execute("SELECT * FROM favorites WHERE id = ?", (cursor.lastrowid,)).fetchone()


def list_favorites(user_id: int) -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()


def delete_favorite(favorite_id: int, user_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM favorites WHERE id = ? AND user_id = ?", (favorite_id, user_id))
        return cursor.rowcount > 0
