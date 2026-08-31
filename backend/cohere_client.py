import base64
import json
import os

import requests

CHAT_URL = "https://api.cohere.com/v2/chat"
MODEL = "command-a-vision-07-2025"

PROMPT = (
    "You are a nutrition estimation assistant. Look at the photo of a meal and identify "
    "the food. Respond with ONLY a single JSON object (no markdown fences, no commentary) "
    "in exactly this shape:\n"
    '{"food_name": "short name of the dish", '
    '"description": "one sentence describing what you see and the estimated portion size", '
    '"estimated_calories": <integer total calories for the whole plate/portion shown>, '
    '"confidence": "low" | "medium" | "high"}'
)


class CohereEstimationError(RuntimeError):
    pass


def _api_key() -> str:
    api_key = os.environ.get("COHERE_API_KEY")
    if not api_key:
        raise CohereEstimationError(
            "COHERE_API_KEY is not set. Add it to backend/.env (see backend/.env.example)."
        )
    return api_key


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text[:-3]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


def estimate_calories(image_bytes: bytes, content_type: str) -> dict:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{content_type};base64,{encoded}"

    try:
        response = requests.post(
            CHAT_URL,
            headers={
                "Authorization": f"Bearer {_api_key()}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": PROMPT},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
            },
            timeout=60,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise CohereEstimationError(f"Cohere API request failed: {exc}") from exc

    body = response.json()
    try:
        raw_text = "".join(
            item["text"] for item in body["message"]["content"] if item.get("type") == "text"
        )
    except (KeyError, TypeError) as exc:
        raise CohereEstimationError(f"Unexpected Cohere response shape: {body!r}") from exc

    try:
        result = json.loads(_strip_code_fences(raw_text))
    except json.JSONDecodeError as exc:
        raise CohereEstimationError(
            f"Could not parse Cohere's response as JSON: {raw_text!r}"
        ) from exc

    required_fields = {"food_name", "description", "estimated_calories", "confidence"}
    if not required_fields.issubset(result):
        raise CohereEstimationError(f"Cohere response missing expected fields: {result!r}")

    return result
