import { NextRequest } from 'next/server';
import { POST } from '@/app/api/translate/route';

describe('/api/translate Route', () => {
  it('rejects empty text with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: '', targetLanguage: 'hi' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('rejects unsupported target languages with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello', targetLanguage: 'es' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Target language must be one of: en, hi, mr/);
  });

  it('returns original text if targetLanguage equals sourceLanguage', async () => {
    const text = 'Water evaporates from lakes and oceans.';
    const req = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage: 'en', sourceLanguage: 'en' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.translatedText).toBe(text);
    expect(data.targetLanguage).toBe('en');
  });

  it('translates to Hindi and provides child-friendly educational text', async () => {
    const text = 'Plants need sunlight and water for photosynthesis.';
    const req = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage: 'hi', sourceLanguage: 'en' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.targetLanguage).toBe('hi');
    expect(typeof data.translatedText).toBe('string');
    expect(data.translatedText.length).toBeGreaterThan(0);
    // Hindi translation must be in Devanagari
    expect(/[\u0900-\u097F]/.test(data.translatedText)).toBe(true);
  });

  it('translates to Marathi and provides child-friendly educational text', async () => {
    const text = 'The water cycle consists of evaporation, condensation, and precipitation.';
    const req = new NextRequest('http://localhost:3000/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage: 'mr', sourceLanguage: 'en' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.targetLanguage).toBe('mr');
    expect(typeof data.translatedText).toBe('string');
    expect(data.translatedText.length).toBeGreaterThan(0);
    // Marathi translation must be in Devanagari
    expect(/[\u0900-\u097F]/.test(data.translatedText)).toBe(true);
  });
});
