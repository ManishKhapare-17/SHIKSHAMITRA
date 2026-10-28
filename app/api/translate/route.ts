import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Language } from '@/lib/types';

interface TranslateRequest {
  text: string;
  targetLanguage: Language;
  sourceLanguage?: Language;
  context?: string;
}

// Regex to check if text contains Devanagari characters
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

// Educational dictionary fallback for common concepts when offline
const EDUCATIONAL_TERMS: Record<string, { hi: string; mr: string }> = {
  fraction: { hi: 'भिन्न', mr: 'अपूर्णांक' },
  fractions: { hi: 'भिन्न', mr: 'अपूर्णांक' },
  numerator: { hi: 'अंश', mr: 'अंश' },
  denominator: { hi: 'हर', mr: 'छेद' },
  whole: { hi: 'पूर्ण', mr: 'पूर्ण' },
  'equal parts': { hi: 'बराबर हिस्से', mr: 'समान भाग' },
  'water cycle': { hi: 'जल चक्र', mr: 'जलचक्र' },
  evaporation: { hi: 'वाष्पीकरण', mr: 'बाष्पीभवन' },
  condensation: { hi: 'संघनन', mr: 'संघनन' },
  precipitation: { hi: 'वर्षण (बारिश)', mr: 'पर्जन्यवृष्टी (पाऊस)' },
  collection: { hi: 'जल संचयन', mr: 'पाणी साठवणे' },
  noun: { hi: 'संज्ञा', mr: 'नाम' },
  nouns: { hi: 'संज्ञाएँ', mr: 'नामे' },
  'proper noun': { hi: 'व्यक्तिवाचक संज्ञा', mr: 'विशेष नाम' },
  'common noun': { hi: 'जातिवाचक संज्ञा', mr: 'सामान्य नाम' },
};

function simpleEducationalFallbackTranslate(text: string, targetLanguage: Language): string {
  if (targetLanguage === 'en') return text;

  let translated = text;
  for (const [enTerm, trans] of Object.entries(EDUCATIONAL_TERMS)) {
    const regex = new RegExp(`\\b${enTerm}\\b`, 'gi');
    translated = translated.replace(regex, trans[targetLanguage]);
  }

  if (targetLanguage === 'hi') {
    return `नमस्ते बच्चों! ${translated}`;
  }
  return `नमस्कार मुलांनो! ${translated}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateRequest;
    const { text, targetLanguage, context } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text to translate must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!targetLanguage || !['en', 'hi', 'mr'].includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Target language must be one of: en, hi, mr.' },
        { status: 400 }
      );
    }

    // If target language is already English, return clean text
    if (targetLanguage === 'en') {
      return NextResponse.json({
        translatedText: text.trim(),
        targetLanguage: 'en',
        isAiTranslated: false,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // 1. Try Gemini AI Translation if API key is present
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            temperature: 0.2,
          },
        });

        const langName = targetLanguage === 'hi' ? 'Hindi (हिंदी)' : 'Marathi (मराठी)';
        const prompt = `You are a warm, supportive primary-school teacher in India.
Translate the following 4th-grade educational lesson text into simple, natural, child-friendly ${langName}.
Guidelines:
1. Use clear Devanagari script.
2. Keep words easy to understand for an 8-10 year old child.
3. Preserve mathematical formulas, fractions (like 1/2, 3/4), numbers, and technical terms in brackets where helpful.
4. Do NOT add meta commentary, explanations about the translation, or conversational filler. Return ONLY the translated text.
${context ? `Context: ${context}` : ''}

Original English text:
"""
${text.trim()}
"""`;

        const result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();

        // Validate that translation is non-empty and contains Devanagari script
        if (translatedText.length > 0 && DEVANAGARI_REGEX.test(translatedText)) {
          return NextResponse.json({
            translatedText,
            targetLanguage,
            isAiTranslated: true,
          });
        }
      } catch (geminiErr) {
        console.warn('[translate] Gemini AI translation error, using fallback:', geminiErr);
      }
    }

    // 2. Deterministic Fallback if offline or Gemini unavailable
    const fallbackText = simpleEducationalFallbackTranslate(text.trim(), targetLanguage);
    return NextResponse.json({
      translatedText: fallbackText,
      targetLanguage,
      isAiTranslated: false,
      isFallback: true,
    });
  } catch (err: unknown) {
    console.error('[translate] Route error:', err instanceof Error ? err.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to process translation request.' },
      { status: 500 }
    );
  }
}
