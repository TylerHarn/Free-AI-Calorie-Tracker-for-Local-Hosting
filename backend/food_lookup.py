import requests
import truststore

truststore.inject_into_ssl()

PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
FIELDS = "product_name,nutriments,serving_quantity,serving_size"
USER_AGENT = "AI-Powered-Calorie-Tracker/1.0 (personal household app)"


class FoodLookupError(RuntimeError):
    pass


def lookup_barcode(barcode: str) -> dict:
    try:
        response = requests.get(
            PRODUCT_URL.format(barcode=barcode),
            params={"fields": FIELDS},
            headers={"User-Agent": USER_AGENT},
            timeout=20,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise FoodLookupError(f"Open Food Facts request failed: {exc}") from exc

    body = response.json()
    if body.get("status") != 1 or "product" not in body:
        raise FoodLookupError(f"No product found for barcode {barcode!r}.")

    product = body["product"]
    nutriments = product.get("nutriments", {})
    food_name = product.get("product_name") or f"Barcode {barcode}"

    quantity_g = product.get("serving_quantity") or 100
    try:
        quantity_g = float(quantity_g)
    except (TypeError, ValueError):
        quantity_g = 100

    def scaled(key: str) -> int:
        per_100g = nutriments.get(key) or 0
        return round(float(per_100g) * quantity_g / 100)

    serving_size = product.get("serving_size")
    description = f"Barcode scan — {serving_size}" if serving_size else f"Barcode scan — {round(quantity_g)}g serving"

    return {
        "food_name": food_name,
        "description": description,
        "estimated_calories": scaled("energy-kcal_100g"),
        "protein_g": scaled("proteins_100g"),
        "carbs_g": scaled("carbohydrates_100g"),
        "fat_g": scaled("fat_100g"),
        "confidence": "barcode",
    }
