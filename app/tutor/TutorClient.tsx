'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, RotateCcw, Brain, AlertTriangle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { Button, Card, ThinkingDots } from '@/components/ui';
import { LESSON_MAP } from '@/lib/lessons';
import { SUBJECT_MAP } from '@/lib/subjects';
import type { TutorMessage } from '@/lib/types';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

const MAX_INPUT_LENGTH = 800;

const OFFLINE_HINTS: Record<string, string[]> = {
  'math-fractions-g4': [
    'A fraction has two parts: the numerator (top) shows how many parts you have, and the denominator (bottom) shows how many equal parts the whole is divided into.',
    'Think of a pizza cut into equal slices — each slice is a fraction of the whole pizza!',
    'To compare fractions with the same denominator, compare the numerators — bigger numerator = bigger fraction.',
  ],
  'sci-water-cycle-g4': [
    'The water cycle has four stages: Evaporation → Condensation → Precipitation → Collection.',
    'Evaporation happens when the sun heats water and turns it into invisible water vapour.',
    'Condensation is when water vapour cools and turns back into tiny water droplets, forming clouds.',
  ],
  'eng-nouns-g4': [
    'A noun names a person, place, thing, or idea. Ask: "Is this a name of something?" If yes, it\'s a noun!',
    'Proper nouns are specific names and always start with a CAPITAL LETTER. Example: Mumbai, Priya.',
    'Abstract nouns are feelings or ideas you cannot touch: love, courage, happiness.',
  ],
};

function getOfflineHint(lessonId?: string): string {
  if (lessonId && OFFLINE_HINTS[lessonId]) {
    const hints = OFFLINE_HINTS[lessonId];
    return hints[Math.floor(Math.random() * hints.length)];
  }
  return "I'm in offline mode. Check your lesson for step-by-step explanations and real-life examples!";
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function renderContent(content: string) {
  return content.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function TutorClient() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lesson') ?? undefined;
  const lesson = lessonId ? LESSON_MAP[lessonId] : undefined;
  const subject = lesson ? SUBJECT_MAP[lesson.subjectId] : undefined;

  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: lesson
          ? `Hello! 👋 I'm your ShikshaMitra AI Tutor. I see you're studying **${lesson.title}** in ${subject?.name}.\n\nAsk me anything about this topic — I'll explain it step by step!`
          : `Hello! 👋 I'm your ShikshaMitra AI Tutor!\n\nAsk me anything about Mathematics, Science & EVS, or English. What would you like to learn today?`,
        timestamp: new Date().toISOString(),
      }]);
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson, subject]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || text.length > MAX_INPUT_LENGTH) return;

    const userMsg: TutorMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (!online) {
      const hint = getOfflineHint(lessonId);
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: generateId(),
          role: 'assistant',
          content: `📚 **Built-in Hint** *(Offline — not a live AI response)*\n\n${hint}`,
          timestamp: new Date().toISOString(),
          isOffline: true,
        }]);
        setLoading(false);
      }, 600);
      return;
    }

    // Build API message history
    const apiMessages = messages
      .filter((m) => !m.isOffline && !m.isError)
      .map((m) => ({ role: m.role, content: m.content }))
      .concat({ role: 'user' as const, content: text })
      .slice(-18); // max 18 messages in history

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          ...(lesson && {
            lessonContext: {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              subjectName: subject?.name ?? '',
            },
          }),
        }),
      });

      const data = await res.json() as { reply?: string; error?: string };

      if (!res.ok || data.error) {
        const isUnconfigured = res.status === 503;
        const msg = isUnconfigured
          ? `⚠️ **AI Tutor not configured**\n\nA GEMINI_API_KEY is needed. Ask a parent or teacher to set it up.\n\n**Built-in hint:** ${getOfflineHint(lessonId)}`
          : `❌ **Temporary issue.** Please try again.\n\n**Built-in hint:** ${getOfflineHint(lessonId)}`;
        setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: msg, timestamp: new Date().toISOString(), isError: true }]);
      } else {
        setMessages((prev) => [...prev, { id: generateId(), role: 'assistant', content: data.reply ?? '', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: generateId(), role: 'assistant',
        content: `❌ **Couldn't reach the AI.** Check your internet connection and try again.\n\n**Built-in hint:** ${getOfflineHint(lessonId)}`,
        timestamp: new Date().toISOString(), isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, online, messages, lesson, subject, lessonId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); }
  };

  const clearChat = useCallback(() => {
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: 'Chat cleared! 👋 What would you like to learn?',
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:pt-16">
      <NavBar />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-violet-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-800 text-sm">ShikshaMitra AI Tutor</h1>
          <p className="text-xs text-slate-500 truncate">
            {lesson ? `Discussing: ${lesson.title}` : 'Ask about Maths, Science, or English'}
          </p>
        </div>
        {!online && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium">
            <AlertTriangle className="w-3 h-3" /> Offline
          </span>
        )}
        <button onClick={clearChat} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Clear chat" aria-label="Clear chat">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ paddingBottom: '130px' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Brain className="w-4 h-4 text-violet-700" />
              </div>
            )}
            <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-tr-sm'
                : msg.isOffline
                ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm'
                : msg.isError
                ? 'bg-red-50 text-red-900 border border-red-200 rounded-tl-sm'
                : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
            }`}>
              {renderContent(msg.content)}
              <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-violet-200' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.isOffline && ' · Built-in hint'}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mr-2">
              <Brain className="w-4 h-4 text-violet-700" />
            </div>
            <Card className="px-4 py-3 inline-flex">
              <ThinkingDots />
            </Card>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 z-30">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder={online ? 'Ask me anything about your lesson… (Enter to send)' : 'Ask for a hint (offline mode)…'}
              rows={1}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-slate-50"
              style={{ minHeight: 44, maxHeight: 120 }}
              aria-label="Message to AI tutor"
            />
            {input.length > 700 && (
              <p className="absolute -top-5 right-0 text-xs text-amber-600">{MAX_INPUT_LENGTH - input.length} chars left</p>
            )}
          </div>
          <Button onClick={() => void sendMessage()} disabled={!input.trim() || loading} size="md" aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-slate-400 mt-1.5 max-w-4xl mx-auto">
          AI explanations are for learning support — verify important answers with your teacher.
        </p>
      </div>
    </div>
  );
}
