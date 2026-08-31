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
