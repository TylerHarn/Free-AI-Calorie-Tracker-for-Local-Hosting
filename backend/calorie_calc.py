ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "very_active": 1.725,
    "extra_active": 1.9,
}

# Safety floors so a large deficit request never recommends an unsafe daily intake.
MIN_CALORIES = {"male": 1500, "female": 1200}

KCAL_DEFICIT_PER_LB_PER_WEEK = 500  # 3,500 kcal/lb spread over 7 days


def ft_in_to_cm(feet: float, inches: float) -> float:
    total_inches = feet * 12 + inches
    return total_inches * 2.54


def lb_to_kg(pounds: float) -> float:
    return pounds * 0.45359237


# MET (metabolic equivalent) values, approximated from the Compendium of Physical
# Activities. calories_burned = MET * weight_kg * duration_hours.
ACTIVITIES = {
    "walking": ("Walking (moderate pace)", 3.5),
    "brisk_walking": ("Brisk walking", 4.5),
    "running": ("Running (~5 mph)", 8.5),
    "running_fast": ("Running (~7 mph)", 11.0),
    "cycling": ("Cycling (moderate)", 7.5),
    "cycling_vigorous": ("Cycling (vigorous)", 10.0),
    "swimming": ("Swimming (moderate)", 6.0),
    "weight_training": ("Weight training", 3.5),
    "yoga": ("Yoga", 2.5),
    "hiit": ("HIIT", 8.0),
    "elliptical": ("Elliptical trainer", 5.0),
    "hiking": ("Hiking", 6.0),
    "dancing": ("Dancing", 4.5),
    "basketball": ("Basketball", 6.5),
    "soccer": ("Soccer", 7.0),
    "stair_climbing": ("Stair climbing", 8.8),
    "rowing": ("Rowing machine", 7.0),
    "pilates": ("Pilates", 3.0),
}


def list_activities() -> list[dict]:
    return [{"value": key, "label": label, "met": met} for key, (label, met) in ACTIVITIES.items()]


def estimate_workout_calories(activity: str, duration_minutes: float, weight_kg: float) -> dict:
    if activity not in ACTIVITIES:
        raise ValueError(f"Unknown activity: {activity!r}")

    label, met = ACTIVITIES[activity]
    calories_burned = round(met * weight_kg * (duration_minutes / 60))
    return {"activity_name": label, "calories_burned": max(calories_burned, 0)}


def compute_daily_calorie_goal(
    sex: str,
    age: int,
    height_cm: float,
    weight_kg: float,
    activity_level: str,
    weekly_loss_rate_lb: float,
) -> int:
    if activity_level not in ACTIVITY_MULTIPLIERS:
        raise ValueError(f"Unknown activity level: {activity_level!r}")
    if sex not in MIN_CALORIES:
        raise ValueError(f"Unknown sex: {sex!r}")

    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + (5 if sex == "male" else -161)
    tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]
    deficit = weekly_loss_rate_lb * KCAL_DEFICIT_PER_LB_PER_WEEK
    goal = tdee - deficit

    return max(round(goal), MIN_CALORIES[sex])
