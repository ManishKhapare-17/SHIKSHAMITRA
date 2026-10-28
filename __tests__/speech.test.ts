import {
  LOCALE_MAP,
  getVoiceStatus,
  isSpeechSynthesisSupported,
} from '@/lib/speech';

describe('Speech Service (lib/speech.ts)', () => {
  it('supports strictly English, Hindi, and Marathi locales', () => {
    expect(LOCALE_MAP.en).toContain('en-IN');
    expect(LOCALE_MAP.hi).toContain('hi-IN');
    expect(LOCALE_MAP.mr).toContain('mr-IN');
  });

  it('safely handles voice status query when no window or no native voice is present', () => {
    const statusMr = getVoiceStatus('mr');
    expect(statusMr).toBeDefined();
    expect(statusMr.lang).toBe('mr');
    // When no speech synthesis is available in node environment, returns available: false
    expect(statusMr.available).toBe(false);
    expect(statusMr.message).toBeDefined();
    expect(statusMr.message).toContain('Marathi');

    const statusHi = getVoiceStatus('hi');
    expect(statusHi.lang).toBe('hi');
    expect(statusHi.available).toBe(false);
    expect(statusHi.message).toContain('Hindi');
  });

  it('identifies lack of browser speech synthesis in Node environment gracefully', () => {
    expect(isSpeechSynthesisSupported()).toBe(false);
  });
});
