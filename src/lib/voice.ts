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
  processLocally?: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onend: (() => void) | null
}

export type OnDeviceSpeechAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable'
export type OnDeviceSpeechResult = 'available' | 'installed' | 'unavailable' | 'unsupported'

interface OnDeviceSpeechOptions {
  langs: string[]
  processLocally: true
}

export interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike
  available?: (options: OnDeviceSpeechOptions) => Promise<OnDeviceSpeechAvailability>
  install?: (options: OnDeviceSpeechOptions) => Promise<boolean>
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function speechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

export async function enableOnDeviceRecognition(Constructor: SpeechRecognitionConstructor, instance: SpeechRecognitionLike, language = 'en-US'): Promise<OnDeviceSpeechResult> {
  if (typeof Constructor.available !== 'function' || !('processLocally' in instance)) return 'unsupported'
  const options: OnDeviceSpeechOptions = { langs: [language], processLocally: true }
  try {
    const status = await Constructor.available(options)
    if (status === 'available') {
      instance.lang = language
      instance.processLocally = true
      return 'available'
    }
    if (status === 'downloadable' || status === 'downloading') {
      if (typeof Constructor.install !== 'function') return 'unavailable'
      const installed = await Constructor.install(options)
      if (installed) {
        instance.lang = language
        instance.processLocally = true
        return 'installed'
      }
    }
    return 'unavailable'
  } catch {
    return 'unsupported'
  }
}
