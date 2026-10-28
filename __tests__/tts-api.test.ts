import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/tts/route';

describe('/api/tts Route', () => {
  it('rejects empty text requests with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts?lang=mr&text=');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('rejects POST requests with empty body with 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text: '', language: 'mr' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
