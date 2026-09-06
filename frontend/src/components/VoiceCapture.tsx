import { useRef, useState } from "react";

interface VoiceCaptureProps {
  onEstimate: (description: string) => void;
  isEstimating: boolean;
}

type Status = "idle" | "listening" | "review" | "unsupported";

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function errorMessageFor(error: string): string {
  switch (error) {
    case "not-allowed":
    case "permission-denied":
      return "Microphone access was denied.";
    case "no-speech":
      return "Didn't catch that — try again.";
    case "network":
      return "Network error — try again.";
    default:
      return "Something went wrong.";
  }
}

export default function VoiceCapture({ onEstimate, isEstimating }: VoiceCaptureProps) {
  const [status, setStatus] = useState<Status>(() => (getSpeechRecognitionCtor() ? "idle" : "unsupported"));
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  function startListening() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }

    setErrorMessage(null);
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript.trim() ?? "";
      if (!text) {
        setErrorMessage(errorMessageFor("no-speech"));
        setStatus("idle");
        return;
      }
      setTranscript(text);
      setStatus("review");
    };

    recognition.onerror = (event) => {
      setErrorMessage(errorMessageFor(event.error));
      setStatus("idle");
    };

    recognition.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setStatus("listening");
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function tryAgain() {
    setTranscript("");
    setErrorMessage(null);
    setStatus("idle");
  }

  if (status === "review") {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper-raised p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm text-ink/70">"{transcript}"</p>
        </div>
        <button
          type="button"
          onClick={tryAgain}
          className="shrink-0 font-sans text-sm font-medium text-ink/40 hover:text-ink"
        >
          Try again
        </button>
        <button
          type="button"
          disabled={isEstimating}
          onClick={() => onEstimate(transcript)}
          className="shrink-0 rounded-full bg-ember px-4 py-2 font-sans text-sm font-semibold text-cream transition hover:bg-ember/90 disabled:opacity-50"
        >
          {isEstimating ? "Estimating…" : "Use this"}
        </button>
      </div>
    );
  }

  const isListening = status === "listening";
  const isUnsupported = status === "unsupported";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        disabled={isUnsupported}
        onClick={isListening ? stopListening : startListening}
        aria-label={isUnsupported ? "Voice logging not supported in this browser" : "Log a meal by voice"}
        className={
          "flex h-24 w-24 items-center justify-center rounded-full border-2 border-white transition active:scale-95 " +
          (isUnsupported
            ? "bg-ink/10 text-ink/40"
            : isListening
              ? "animate-pulse bg-black text-white shadow-lg ring-4 ring-white/40"
              : "bg-black text-white shadow-lg")
        }
      >
        {isUnsupported ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-10 w-10">
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-10 w-10">
            <path
              d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 10v2a7 7 0 0 1-14 0v-2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
      <p className="font-sans text-sm font-medium text-ink/70">
        {isUnsupported ? "Voice input isn't supported in this browser" : isListening ? "Listening…" : "Log a meal by voice"}
      </p>
      {errorMessage && <p className="font-sans text-xs text-rust">{errorMessage}</p>}
    </div>
  );
}
