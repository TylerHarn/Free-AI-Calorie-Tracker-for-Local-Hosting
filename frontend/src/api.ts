export type Confidence = "low" | "medium" | "high" | "manual";

export interface MealEstimate {
  food_name: string;
  description: string;
  estimated_calories: number;
  confidence: Confidence;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal extends MealEstimate {
  id: number;
  created_at: string;
}

export interface WorkoutEstimate {
  activity_name: string;
  calories_burned: number;
}

export interface Workout extends WorkoutEstimate {
  id: number;
  created_at: string;
}

export interface Activity {
  value: string;
  label: string;
  met: number;
}

export interface HouseholdMember {
  id: number;
  name: string;
  setup_complete: boolean;
}

export interface User {
  id: number;
  name: string;
  sex: "male" | "female" | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  weekly_loss_rate_lb: number | null;
  daily_calorie_goal: number | null;
}

export type ActivityLevel = "sedentary" | "light" | "moderate" | "very_active" | "extra_active";

export interface SetupPayload {
  sex: "male" | "female";
  age: number;
  height_ft: number;
  height_in: number;
  weight_lb: number;
  activity_level: ActivityLevel;
  weekly_loss_rate_lb: number;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // fall through to generic message
  }
  return `Request failed with status ${response.status}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export function getUsers(): Promise<HouseholdMember[]> {
  return request("/api/users");
}

export function createUser(name: string): Promise<User> {
  return request("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export function selectUser(userId: number): Promise<User> {
  return request("/api/auth/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
}

export function getMe(): Promise<User> {
  return request("/api/auth/me");
}

export function logout(): Promise<{ ok: boolean }> {
  return request("/api/auth/logout", { method: "POST" });
}

export function saveSetup(payload: SetupPayload): Promise<User> {
  return request("/api/users/me/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function estimateMeal(image: Blob): Promise<MealEstimate> {
  const formData = new FormData();
  formData.append("image", image, "meal.jpg");

  return request("/api/meals/estimate", {
    method: "POST",
    body: formData,
  });
}

export function estimateMealFromName(foodName: string): Promise<MealEstimate> {
  return request("/api/meals/estimate-from-name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food_name: foodName }),
  });
}

export function addMeal(entry: MealEstimate): Promise<Meal> {
  return request("/api/meals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

export function updateMealCalories(id: number, estimatedCalories: number): Promise<Meal> {
  return request(`/api/meals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estimated_calories: estimatedCalories }),
  });
}

export function updateMealMacros(
  id: number,
  macros: { protein_g: number; carbs_g: number; fat_g: number }
): Promise<Meal> {
  return request(`/api/meals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(macros),
  });
}

export function deleteMeal(id: number): Promise<{ ok: boolean }> {
  return request(`/api/meals/${id}`, { method: "DELETE" });
}

export function getMealHistory(): Promise<Meal[]> {
  return request("/api/meals");
}

export function getActivities(): Promise<Activity[]> {
  return request("/api/workouts/activities");
}

export function estimateWorkout(activity: string, durationMinutes: number): Promise<WorkoutEstimate> {
  return request("/api/workouts/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, duration_minutes: durationMinutes }),
  });
}

export function addWorkout(entry: WorkoutEstimate): Promise<Workout> {
  return request("/api/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

export function updateWorkoutCalories(id: number, caloriesBurned: number): Promise<Workout> {
  return request(`/api/workouts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ calories_burned: caloriesBurned }),
  });
}

export function deleteWorkout(id: number): Promise<{ ok: boolean }> {
  return request(`/api/workouts/${id}`, { method: "DELETE" });
}

export function getWorkoutHistory(): Promise<Workout[]> {
  return request("/api/workouts");
}
