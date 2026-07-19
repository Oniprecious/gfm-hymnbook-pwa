const small: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}

export function parseVoiceNumber(spoken: string | null | undefined): number | null {
  if (!spoken) return null
  const digits = spoken.match(/(?<!\d)(\d{1,4})(?!\d)/)
  if (digits?.[1]) return inRange(Number.parseInt(digits[1], 10))
  const words = spoken.toLocaleLowerCase().replaceAll('-', ' ').replace(/[^a-z ]/g, ' ').trim().split(/\s+/)
  let total = 0
  let current = 0
  let found = false
  for (const word of words) {
    const value = small[word]
    if (value !== undefined) {
      current += value
      found = true
    } else if (word === 'hundred') {
      current = Math.max(1, current) * 100
      found = true
    } else if (word === 'thousand') {
      total += Math.max(1, current) * 1000
      current = 0
      found = true
    }
  }
  return found ? inRange(total + current) : null
}

function inRange(value: number): number | null {
  return value >= 1 && value <= 1048 ? value : null
}

export interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: { transcript: string }; length: number }; length: number }
}

export interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function speechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}
