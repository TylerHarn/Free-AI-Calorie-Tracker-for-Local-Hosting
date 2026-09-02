import { useRef, useState } from "react";

interface PhotoCaptureProps {
  onEstimate: (image: Blob) => void;
  isEstimating: boolean;
}

export default function PhotoCapture({ onEstimate, isEstimating }: PhotoCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedBlob(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  if (previewUrl && selectedBlob) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper-raised p-4">
        <img src={previewUrl} alt="Selected meal" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm text-ink/70">Ready to estimate</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPreviewUrl(null);
            setSelectedBlob(null);
          }}
          className="shrink-0 font-sans text-sm font-medium text-ink/40 hover:text-ink"
        >
          Retake
        </button>
        <button
          type="button"
          disabled={isEstimating}
          onClick={() => onEstimate(selectedBlob)}
          className="shrink-0 rounded-full bg-ember px-4 py-2 font-sans text-sm font-semibold text-cream transition hover:bg-ember/90 disabled:opacity-50"
        >
          {isEstimating ? "Estimating…" : "Estimate"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Log a meal photo"
        className="flex h-24 w-24 items-center justify-center rounded-full bg-ember text-cream shadow-lg shadow-ember/30 transition active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-10 w-10">
          <path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      <p className="font-sans text-sm font-medium text-ink/70">Log a meal</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
