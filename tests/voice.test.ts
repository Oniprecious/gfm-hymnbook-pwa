import { describe, expect, it, vi } from 'vitest'
import { enableOnDeviceRecognition, parseVoiceNumber, type SpeechRecognitionConstructor, type SpeechRecognitionLike } from '../src/lib/voice'

function recognitionFixture(): SpeechRecognitionLike {
  return Object.assign(new EventTarget(), {
    lang: '', continuous: false, interimResults: false, maxAlternatives: 1, processLocally: false,
    start: vi.fn(), stop: vi.fn(), abort: vi.fn(), onresult: null, onerror: null, onend: null,
  })
}

describe('voice hymn number parser', () => {
  it('parses the Android-supported digit and English word forms', () => {
    expect(parseVoiceNumber('open hymn 303')).toBe(303)
    expect(parseVoiceNumber('six hundred and one')).toBe(601)
    expect(parseVoiceNumber('one thousand and forty eight')).toBe(1048)
  })

  it('rejects missing and out-of-range values', () => {
    expect(parseVoiceNumber('please open a hymn')).toBeNull()
    expect(parseVoiceNumber('hymn 2000')).toBeNull()
    expect(parseVoiceNumber(null)).toBeNull()
  })

  it('enables an installed on-device language pack', async () => {
    const Constructor = Object.assign(function Recognition() {}, {
      available: vi.fn().mockResolvedValue('available'),
      install: vi.fn(),
    }) as unknown as SpeechRecognitionConstructor
    const recognition = recognitionFixture()
    await expect(enableOnDeviceRecognition(Constructor, recognition)).resolves.toBe('available')
    expect(recognition.processLocally).toBe(true)
    expect(recognition.lang).toBe('en-US')
    expect(Constructor.install).not.toHaveBeenCalled()
  })

  it('downloads a supported on-device language pack once', async () => {
    const Constructor = Object.assign(function Recognition() {}, {
      available: vi.fn().mockResolvedValue('downloadable'),
      install: vi.fn().mockResolvedValue(true),
    }) as unknown as SpeechRecognitionConstructor
    const recognition = recognitionFixture()
    await expect(enableOnDeviceRecognition(Constructor, recognition)).resolves.toBe('installed')
    expect(recognition.processLocally).toBe(true)
    expect(Constructor.install).toHaveBeenCalledOnce()
  })
})
