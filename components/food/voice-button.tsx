'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type RecognitionResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionErrorEvent = { error: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};

/**
 * Dictation for any text field. Browsers without speech recognition (Firefox,
 * many wall-display WebViews) get a disabled mic with an explanation, and the
 * field keeps working as a normal typed input — that is the fallback.
 */
export function VoiceButton({ onResult, label, className }: { onResult: (text: string) => void; label: string; className?: string }) {
  const supported = useSyncExternalStore(noopSubscribe, () => getCtor() !== null, () => false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Recognition | null>(null);

  function start() {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim();
      if (text) onResult(text);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Microphone access is blocked. Allow it in browser settings, or type instead.');
      } else if (e.error !== 'aborted' && e.error !== 'no-speech') {
        toast.error('Voice entry did not work this time. Please type instead.');
      }
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      toast.error('Voice entry could not start. Please type instead.');
    }
  }

  const title = !supported
    ? 'Voice entry is not available in this browser. Type instead.'
    : listening
      ? 'Listening. Tap to stop.'
      : label;

  return (
    <button
      type="button"
      onClick={() => (listening ? recRef.current?.stop() : start())}
      disabled={!supported}
      aria-pressed={listening}
      aria-label={title}
      title={title}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors',
        listening
          ? 'border-destructive bg-destructive text-destructive-foreground animate-pulse'
          : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
    >
      {supported ? <Mic className="h-5 w-5" aria-hidden="true" /> : <MicOff className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
