import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TutorRequest } from '@/lib/types';

// ──── Constants ───────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_LESSON_TITLE_LENGTH = 100;
const MAX_SUBJECT_NAME_LENGTH = 50;

const SYSTEM_INSTRUCTION = `You are ShikshaMitra Tutor, a warm and patient AI teaching assistant for primary school students (ages 8–12, Grade 4 level).

Your role:
- Explain academic concepts clearly and simply, as a caring teacher would
- Break down hard ideas into easy steps
- Use relatable real-life examples relevant to Indian children
- Encourage students warmly — never make them feel bad for not knowing something
- Guide students through reasoning step by step, rather than just giving answers
- Keep responses concise (3–5 short paragraphs maximum)
- Use simple vocabulary appropriate for 10-year-olds
- When asked about maths, science, or English grammar, give clear explanations with examples

Rules:
- Never use complex jargon without explaining it
- Never provide inappropriate, harmful, or off-topic content
- If a question is outside school subjects, gently redirect to learning topics
- Always be encouraging and positive
- Do not claim your answers are guaranteed correct — frame them as explanations to check with their teacher
- Never pretend to be a human teacher

Subjects you help with: Mathematics, Science / EVS, English language and grammar.`;

// ──── Input validation ────────────────────────────────────────

function validateRequest(body: unknown): TutorRequest | null {
  if (!body || typeof body !== 'object') return null;
  const req = body as Record<string, unknown>;

  if (!Array.isArray(req.messages)) return null;
  if (req.messages.length === 0 || req.messages.length > MAX_HISTORY_MESSAGES) return null;

  for (const msg of req.messages) {
    if (!msg || typeof msg !== 'object') return null;
    const m = msg as Record<string, unknown>;
    if (m.role !== 'user' && m.role !== 'assistant') return null;
    if (typeof m.content !== 'string') return null;
    if (m.content.length === 0 || m.content.length > MAX_MESSAGE_LENGTH) return null;
  }

  // Validate optional lesson context
  if (req.lessonContext !== undefined) {
    const ctx = req.lessonContext as Record<string, unknown>;
    if (
      typeof ctx.lessonId !== 'string' ||
      typeof ctx.lessonTitle !== 'string' ||
      typeof ctx.subjectName !== 'string' ||
      ctx.lessonTitle.length > MAX_LESSON_TITLE_LENGTH ||
      ctx.subjectName.length > MAX_SUBJECT_NAME_LENGTH
    ) {
      return null;
    }
  }

  return {
    messages: req.messages as TutorRequest['messages'],
    lessonContext: req.lessonContext as TutorRequest['lessonContext'],
  };
}

// ──── Route handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Check API key (server-side only — never exposed to client)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI tutor is not configured. Please add a GEMINI_API_KEY to your environment variables.' },
      { status: 503 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const validated = validateRequest(body);
  if (!validated) {
    return NextResponse.json(
      { error: 'Invalid request. Check message format and length limits.' },
      { status: 400 }
    );
  }

  // Build context-aware system instruction
  let systemInstruction = SYSTEM_INSTRUCTION;
  if (validated.lessonContext) {
    const ctx = validated.lessonContext;
    systemInstruction += `\n\nCurrent lesson context: The student is studying "${ctx.lessonTitle}" in ${ctx.subjectName}. Focus your explanations on this topic when relevant.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    // Build Gemini chat history (all messages except the last user message)
    const history = validated.messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const lastMessage = validated.messages[validated.messages.length - 1];
    if (lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from the user.' }, { status: 400 });
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err: unknown) {
    // Log error server-side but do NOT expose details to client
    console.error('[tutor] Gemini API error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json(
      { error: 'The AI tutor is temporarily unavailable. Please try again in a moment.' },
      { status: 502 }
    );
  }
}

// Reject non-POST methods
export function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
