// ============================================================
// ShikshaMitra AI — Multilingual Speech Synthesis (TTS) API
// Generates authentic Marathi (mr), Hindi (hi), and English (en) audio
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { Language } from '@/lib/types';

const LOCALE_TO_CODE: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi',
  mr: 'mr',
};

function splitTextIntoSpeechChunks(text: string, maxLen: number = 150): string[] {
  // Strip markdown, bullet points, asterisks, hashtags, and decorative emojis
  const clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[•\-\*]\s+/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return [];

  // Split on sentence boundaries (period, question mark, exclamation, or Devanagari danda ।)
  const rawSentences = clean.split(/(?<=[.!?।\n])\s+/);
  const chunks: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      chunks.push(trimmed);
    } else {
      // Split on punctuation or word boundaries
      const subParts = trimmed.match(new RegExp(`.{1,${maxLen}}(\\s|,|;|$)`, 'g')) || [trimmed];
      for (const sp of subParts) {
        const subTrimmed = sp.trim();
        if (subTrimmed) chunks.push(subTrimmed);
      }
    }
  }

  return chunks;
}

async function synthesizeWithGoogleTTS(textChunk: string, langCode: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
    langCode
  )}&client=tw-ob&q=${encodeURIComponent(textChunk)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      Referer: 'https://translate.google.com/',
    },
  });

  if (!res.ok) {
    throw new Error(`Google TTS request failed with HTTP ${res.status}`);
  }

  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export async function GET(req: NextRequest) {
  return handleTTS(req);
}

export async function POST(req: NextRequest) {
  return handleTTS(req);
}

async function handleTTS(req: NextRequest) {
  try {
    let text = '';
    let language: Language = 'mr';

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      text = body.text || '';
      language = body.language || body.lang || 'mr';
    } else {
      const searchParams = req.nextUrl.searchParams;
      text = searchParams.get('text') || '';
      language = (searchParams.get('lang') as Language) || (searchParams.get('language') as Language) || 'mr';
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text parameter is required for speech synthesis.' }, { status: 400 });
    }

    const safeLang: Language = ['en', 'hi', 'mr'].includes(language) ? language : 'mr';
    const langCode = LOCALE_TO_CODE[safeLang] || 'mr';

    // Break text into manageable chunks
    const chunks = splitTextIntoSpeechChunks(text, 150);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No readable speech content found in text.' }, { status: 400 });
    }

    // Limit to maximum 12 chunks (approx 1800 characters) per request for fast delivery
    const cappedChunks = chunks.slice(0, 12);
    const audioBuffers: Buffer[] = [];

    for (const chunk of cappedChunks) {
      const buf = await synthesizeWithGoogleTTS(chunk, langCode);
      audioBuffers.push(buf);
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new NextResponse(combinedAudio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedAudio.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (err: unknown) {
    console.error('[tts-api] Speech synthesis error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      {
        error: 'Speech narration service is temporarily unavailable. Please try again shortly.',
      },
      { status: 502 }
    );
  }
}
