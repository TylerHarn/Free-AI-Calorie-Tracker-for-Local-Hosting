import { useRef, useState } from "react";
import { lookupBarcode, type MealEstimate } from "../api";

export default function ScanBarcode({
  onFound,
  isLoading,
  setIsLoading,
}: {
  onFound: (estimate: MealEstimate) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setIsLoading(true);

    const imageUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = imageUrl;
      await img.decode();

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageElement(img);
      const barcode = result.getText();

      const estimate = await lookupBarcode(barcode);
      onFound(estimate);
    } catch (err) {
      if (err instanceof Error && err.name === "NotFoundException") {
        setError("Couldn't find a barcode in that photo — try again with it closer and in focus.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      URL.revokeObjectURL(imageUrl);
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full py-2 text-center font-sans text-sm font-medium text-ember underline decoration-dotted underline-offset-4 hover:text-ember/80 disabled:opacity-50"
      >
        {isLoading ? "Reading barcode…" : "+ Scan a barcode"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-1 text-center font-sans text-xs text-rust">{error}</p>}
    </div>
  );
}
