import { useEffect, useRef, useState } from "react";
import { lookupBarcode, type MealEstimate } from "../api";

export default function ScanBarcode({
  onFound,
  onClose,
}: {
  onFound: (estimate: MealEstimate) => void;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fileInputRef.current?.click();
  }, []);

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
      onClose();
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
    <div className="rounded-2xl border border-ink/10 bg-paper-raised p-4 text-center">
      <p className="text-sm text-ink/70">{isLoading ? "Reading barcode…" : "Waiting for a photo…"}</p>
      <div className="mt-3 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/15 disabled:opacity-50"
        >
          Retry photo
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 hover:bg-ink/5"
        >
          Cancel
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
