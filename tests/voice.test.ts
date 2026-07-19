import { describe, expect, it } from 'vitest'
import { parseVoiceNumber } from '../src/lib/voice'

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
})
