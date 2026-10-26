'use client'

import { useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

/** Push-to-talk. The transcript is handed back for review — nothing is saved from here. */
export function VoiceCapture({ onTranscript, label = 'Speak' }: { onTranscript: (text: string) => void; label?: string }) {
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  function start() {
    const rec = getRecognition()
    if (!rec) {
      setMessage('Voice input is not supported in this browser. Type the items instead.')
      return
    }
    setMessage(null)
    rec.lang = navigator.language || 'en-US'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (text) onTranscript(text)
    }
    rec.onerror = (e) => {
      setMessage(e.error === 'not-allowed' ? 'Microphone permission was denied. Allow it in browser settings or type instead.' : 'Did not catch that. Try again or type instead.')
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setMessage('Could not start the microphone.')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={listening ? 'default' : 'outline'}
        size="lg"
        className="h-12 rounded-xl"
        aria-pressed={listening}
        onClick={() => (listening ? recRef.current?.stop() : start())}
      >
        {listening ? <MicOff className="w-5 h-5" aria-hidden /> : <Mic className="w-5 h-5" aria-hidden />}
        {listening ? 'Listening… tap to stop' : label}
      </Button>
      {message && <p className="text-xs text-muted-foreground" role="status">{message}</p>}
    </div>
  )
}
