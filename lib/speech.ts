// ============================================================
// ShikshaMitra AI — Web Speech Engine
// Browser Speech Synthesis (TTS) & Speech Recognition (STT)
// ============================================================

import type { Language, TeacherPersona } from './types';

// ──── Language locale mapping for Web Speech API ─────────────
export const LOCALE_MAP: Record<Language, string[]> = {
  en: ['en-IN', 'en-GB', 'en-US', 'en'],
  hi: ['hi-IN', 'hi'],
  mr: ['mr-IN', 'mr'],
};

// ──── Check speech synthesis support ─────────────────────────
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// ──── Check speech recognition support ───────────────────────
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// Cache voices once loaded
let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// ──── Get available voices for language ───────────────────────
export function getAvailableVoices(lang: Language): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const allVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (allVoices.length > 0) {
    cachedVoices = allVoices;
  }
  const locales = LOCALE_MAP[lang] || [];

  return allVoices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace(/_/g, '-');
    const matchesLocale = locales.some((loc) => vLang.startsWith(loc.toLowerCase()));
    if (matchesLocale) return true;

    // Also match voice name keywords
    const vName = v.name.toLowerCase();
    if (lang === 'hi' && (vName.includes('hindi') || vName.includes('हिन्दी') || vName.includes('swara') || vName.includes('hemant') || vName.includes('kalpana'))) return true;
    if (lang === 'mr' && (vName.includes('marathi') || vName.includes('मराठी'))) return true;
    if (lang === 'en' && (vName.includes('english') || vName.includes('en-in') || vName.includes('en-us') || vName.includes('en-gb'))) return true;

    return false;
  });
}

export interface VoiceStatus {
  available: boolean;
  voiceName?: string;
  lang: Language;
  locale: string;
  message?: string;
}

export function getVoiceStatus(lang: Language): VoiceStatus {
  const voices = getAvailableVoices(lang);
  if (voices.length > 0) {
    return {
      available: true,
      voiceName: voices[0].name,
      lang,
      locale: voices[0].lang,
    };
  }
  const langName = lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English';
  return {
    available: false,
    lang,
    locale: LOCALE_MAP[lang]?.[0] || 'en-IN',
    message: `A native ${langName} voice is not installed on your browser/device. Spoken narration cannot play, but complete ${langName} text and captions are displayed so you can read along. To enable audio, install the ${langName} speech package in your OS settings or use Google Chrome.`,
  };
}

export function onVoicesLoaded(callback: () => void): () => void {
  if (!isSpeechSynthesisSupported()) return () => {};
  if (cachedVoices.length > 0 || window.speechSynthesis.getVoices().length > 0) {
    callback();
  }
  const handler = () => {
    cachedVoices = window.speechSynthesis.getVoices();
    callback();
  };
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  return () => {
    window.speechSynthesis.removeEventListener('voiceschanged', handler);
  };
}

// ──── Speak text with teacher persona ────────────────────────
export interface SpeakOptions {
  text: string;
  lang: Language;
  persona?: TeacherPersona;
  rate?: number;
  startCharIndex?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onBoundary?: (charIndex: number) => void;
  onError?: (error: string) => void;
}

let lastCharIndex = 0;
let activeUtterance: SpeechSynthesisUtterance | null = null;

export function getActiveUtterance(): SpeechSynthesisUtterance | null {
  return activeUtterance;
}

export function getLastSpokenCharIndex(): number {
  return lastCharIndex;
}

export function speakText({
  text,
  lang,
  persona = 'female',
  rate = 1,
  startCharIndex = 0,
  onStart,
  onEnd,
  onPause,
  onResume,
  onBoundary,
  onError,
}: SpeakOptions): boolean {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Speech synthesis is not supported on this device/browser.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown markers so narration sounds natural
  const fullCleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•\-\*]\s+/g, '')
    .replace(/🍕|🌊|☁️|🌧️|🌅|🏫|📚|🔬|🔢|📖|⚡|🌱|🔥|⭐|🎉|✅|❌|💡/gu, '')
    .trim();

  if (!fullCleanText) return false;

  const startIndex = Math.max(0, Math.min(startCharIndex, fullCleanText.length));
  const textToSpeak = startIndex > 0 ? fullCleanText.slice(startIndex).trim() : fullCleanText;

  if (!textToSpeak) return false;

  lastCharIndex = startIndex;

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  // Support speeds from 0.5x to 2.0x
  utterance.rate = Math.min(2.0, Math.max(0.5, rate));
  utterance.pitch = persona === 'female' ? 1.05 : 0.95;

  const matchingVoices = getAvailableVoices(lang);
  if (matchingVoices.length > 0) {
    const genderMatcher = persona === 'female' ? /(female|girl|woman|zira|aditi|veena|lekha|swara|kalpana)/i : /(male|boy|man|david|rishi|ravi|hemant)/i;
    const bestVoice = matchingVoices.find((v) => genderMatcher.test(v.name)) || matchingVoices[0];
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang;
  } else {
    // If language is Hindi or Marathi and no native voice is installed, do not speak with English fallback
    if (lang !== 'en') {
      const langName = lang === 'hi' ? 'Hindi' : 'Marathi';
      onError?.(
        `A native ${langName} voice was not found on your browser/device. Please read along with the Devanagari text and captions below, or install the ${langName} speech package in your OS settings.`
      );
      return false;
    }
    utterance.lang = LOCALE_MAP[lang][0];
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    lastCharIndex = fullCleanText.length;
    activeUtterance = null;
    onEnd?.();
  };
  utterance.onpause = () => onPause?.();
  utterance.onresume = () => onResume?.();

  utterance.onboundary = (e) => {
    if (typeof e.charIndex === 'number') {
      const overallIndex = startIndex + e.charIndex;
      lastCharIndex = overallIndex;
      onBoundary?.(overallIndex);
    }
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      onError?.(e.error || 'Voice narration error');
    }
    onEnd?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function pauseSpeaking(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSynthesisSupported() && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

export function stopSpeaking(): void {
  activeUtterance = null;
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

// ──── Browser Speech Recognition instance helper ─────────────
export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

export function createSpeechRecognizer(
  lang: Language,
  onResult: (transcript: string) => void,
  onError: (errMsg: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognition: any = new SpeechRec();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = LOCALE_MAP[lang][0] || 'en-IN';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript.trim()) {
      onResult(finalTranscript);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    let message = 'Speech recognition error';
    if (event.error === 'not-allowed' || event.error === 'permission-denied') {
      message = 'Microphone permission was denied. Please allow microphone access.';
    } else if (event.error === 'no-speech') {
      message = 'No speech detected. Please try speaking again.';
    } else if (event.error === 'network') {
      message = 'Network error during speech recognition.';
    }
    onError(message);
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // Already started
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
    },
  };
}
