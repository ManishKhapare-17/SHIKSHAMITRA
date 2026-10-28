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
    // When no browser voice is available, cloud fallback engine is ready
    expect(statusMr.available).toBe(true);
    expect(statusMr.engine).toBe('cloud');
    expect(statusMr.voiceName).toContain('Marathi');

    const statusHi = getVoiceStatus('hi');
    expect(statusHi.lang).toBe('hi');
    expect(statusHi.available).toBe(true);
    expect(statusHi.engine).toBe('cloud');
  });

  it('identifies lack of browser speech synthesis in Node environment gracefully', () => {
    expect(isSpeechSynthesisSupported()).toBe(false);
  });
});
