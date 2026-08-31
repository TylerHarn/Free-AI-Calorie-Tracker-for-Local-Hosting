import { useEffect, useRef, useState } from "react";

interface PhotoCaptureProps {
  onEstimate: (image: Blob) => void;
  isEstimating: boolean;
}

type Mode = "upload" | "camera";

export default function PhotoCapture({ onEstimate, isEstimating }: PhotoCaptureProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode !== "camera") return;

    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCameraError("Could not access the camera. Check browser permissions."));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [mode]);

  function setBlob(blob: Blob) {
    setSelectedBlob(blob);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(blob);
    });
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      setBlob(file);
    }
  }

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) setBlob(blob);
    }, "image/jpeg");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "upload" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === "camera" ? "bg-white shadow text-slate-900" : "text-slate-500"
          }`}
        >
          Camera
        </button>
      </div>

      {mode === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
            isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-slate-400"
          }`}
        >
          <p className="text-sm text-slate-600">
            Drag and drop a meal photo here, or <span className="font-semibold text-emerald-600">browse</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-3">
          {cameraError ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{cameraError}</p>
          ) : (
            <div className="overflow-hidden rounded-xl bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />
            </div>
          )}
          <button
            type="button"
            onClick={handleCapture}
            disabled={!!cameraError}
            className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            Capture photo
          </button>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {previewUrl && (
        <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3">
          <img src={previewUrl} alt="Selected meal" className="h-20 w-20 rounded-lg object-cover" />
          <button
            type="button"
            disabled={isEstimating || !selectedBlob}
            onClick={() => selectedBlob && onEstimate(selectedBlob)}
            className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isEstimating ? "Estimating..." : "Estimate Calories"}
          </button>
        </div>
      )}
    </div>
  );
}
