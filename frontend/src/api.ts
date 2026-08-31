export interface Meal {
  id: number;
  food_name: string;
  description: string;
  estimated_calories: number;
  confidence: "low" | "medium" | "high";
  created_at: string;
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

export async function estimateMeal(image: Blob): Promise<Meal> {
  const formData = new FormData();
  formData.append("image", image, "meal.jpg");

  const response = await fetch("/api/meals/estimate", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function getMealHistory(): Promise<Meal[]> {
  const response = await fetch("/api/meals");
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
