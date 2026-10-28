import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TutorRequest, Language } from '@/lib/types';

// ──── Constants ───────────────────────────────────────────────

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_LESSON_TITLE_LENGTH = 120;
const MAX_SUBJECT_NAME_LENGTH = 60;
const MAX_DOCUMENT_CONTEXT_LENGTH = 4000;

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

  // Validate language
  let language: Language = 'en';
  if (req.language !== undefined && req.language !== null) {
    if (typeof req.language !== 'string' || !['en', 'hi', 'mr'].includes(req.language)) {
      return null;
    }
    language = req.language as Language;
  }

  // Validate optional lesson context
  let lessonContext: TutorRequest['lessonContext'] = undefined;
  if (req.lessonContext !== undefined && req.lessonContext !== null) {
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

    if (
      ctx.documentContent !== undefined &&
      (typeof ctx.documentContent !== 'string' ||
        ctx.documentContent.length > MAX_DOCUMENT_CONTEXT_LENGTH)
    ) {
      return null;
    }

    if (
      ctx.relevantContent !== undefined &&
      (typeof ctx.relevantContent !== 'string' ||
        ctx.relevantContent.length > MAX_DOCUMENT_CONTEXT_LENGTH)
    ) {
      return null;
    }

    lessonContext = {
      lessonId: ctx.lessonId,
      lessonTitle: ctx.lessonTitle,
      subjectName: ctx.subjectName,
      currentSection: typeof ctx.currentSection === 'string' ? ctx.currentSection.slice(0, 100) : undefined,
      documentContent: typeof ctx.documentContent === 'string' ? ctx.documentContent : undefined,
      relevantContent: typeof ctx.relevantContent === 'string' ? ctx.relevantContent : undefined,
    };
  }

  return {
    messages: req.messages as TutorRequest['messages'],
    language,
    lessonContext,
  };
}

// ──── Route handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Check API key (server-side only)
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
  let systemInstruction = '';

  if (validated.lessonContext) {
    const ctx = validated.lessonContext;
    systemInstruction = `You are ShikshaMitra Tutor, a warm, patient, and encouraging AI teacher helping a 4th-grade student (ages 8–11) understand their active school lesson.

ACTIVE LEARNING CONTEXT:
- Subject: ${ctx.subjectName}
- Lesson Title: "${ctx.lessonTitle}"
${ctx.currentSection ? `- Current Step / Section: "${ctx.currentSection}"` : ''}
${ctx.relevantContent ? `- Current Step Explanation Content:\n"""\n${ctx.relevantContent}\n"""` : ''}
${ctx.documentContent ? `- Reference Document Text:\n"""\n${ctx.documentContent}\n"""` : ''}

IN-LESSON TEACHING GUIDELINES:
1. Directly answer the student's question about this active topic using simple, friendly 4th-grade words.
2. Break down concepts step-by-step and provide a relatable everyday example (e.g. food, home, playground, nature).
3. If the student asks for homework assistance, provide guiding hints rather than simply giving the final answer.
4. Keep explanations concise (2 to 3 short paragraphs).
5. Maintain conversational context for follow-up questions about this topic.
6. STRICT TOPIC RESTRICTION: If the student asks about something completely unrelated to this lesson (e.g. video games, pop music, celebrities, memes, non-academic chit-chat, or hacking), POLITELY REDIRECT THEM:
   "I'm here to help you learn about ${ctx.lessonTitle}! Let's focus on our study topic. What would you like to ask about ${ctx.lessonTitle}?"`;
  } else {
    systemInstruction = `You are ShikshaMitra AI Tutor, a cheerful, patient, and knowledgeable personal AI learning companion for primary-school students (Grade 4 level, ages 8–11).

SUPPORTED CURRICULUM SUBJECTS:
1. Mathematics: Numbers, Fractions, Addition, Subtraction, Multiplication, Division, Geometry & Shapes, Measurement, Time, Word Problems.
2. Science & Environmental Studies (EVS): Water Cycle, Plants & Animals, Human Body, Senses, Weather, Matter & States, Living & Non-living Things.
3. English: Nouns, Verbs, Adjectives, Pronouns, Simple Tenses, Punctuation, Sentence Building, Reading Comprehension.

GENERAL TUTOR TEACHING GUIDELINES:
1. Understand before answering: Identify the subject (Maths, Science, or English) and core concept of the student's question.
2. Structure your response:
   - Direct, reassuring answer in simple words.
   - Clear, step-by-step explanation.
   - A relatable real-life example (e.g. sharing slices of food, drying laundry in the sun, naming items in the classroom).
   - For mathematical calculations, show each step clearly.
3. Maintain conversational context for follow-up questions. For instance, if the student previously asked about evaporation and now asks "Give me an example", recognize that they mean an example of evaporation!
4. Tone: Encouraging, enthusiastic, and warm. Never make a child feel bad for asking a question.
5. If the question is ambiguous or broad, provide a helpful answer for the most likely meaning and ask a gentle clarifying question.
6. If the student asks about non-educational topics (video games, celebrities, social media, entertainment, hacking, or inappropriate topics), politely guide them back:
   "I'm your ShikshaMitra study companion! I'm here to help you with Mathematics, Science, and English. What school topic would you like to learn about today?"`;
  }

  // Language instruction
  if (validated.language === 'hi') {
    systemInstruction += `\n\nLANGUAGE INSTRUCTION: Respond in simple, natural, child-friendly Hindi (हिंदी). Use clear Devanagari script. Keep sentences easy to understand for a 9-year-old child.`;
  } else if (validated.language === 'mr') {
    systemInstruction += `\n\nLANGUAGE INSTRUCTION: Respond in simple, natural, child-friendly Marathi (मराठी). Use clear Devanagari script. Use everyday vocabulary familiar to primary school students.`;
  } else {
    systemInstruction += `\n\nLANGUAGE INSTRUCTION: Respond in simple, warm, friendly Indian English suitable for 10-year-olds.`;
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
