// ============================================================
// ShikshaMitra AI — In-Lesson Doubt Assistant
// Context-grounded doubt assistance without interrupting lesson flow
// ============================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, X, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { Button, Card, ThinkingDots } from './ui';
import type { Language, TeacherPersona } from '@/lib/types';
import { t } from '@/lib/i18n';
import { speakText, stopSpeaking, createSpeechRecognizer, isSpeechRecognitionSupported } from '@/lib/speech';

interface Props {
  lessonId: string;
  lessonTitle: string;
  subjectName: string;
  currentSectionTitle: string;
  relevantContent?: string;
  language: Language;
  teacherPersona: TeacherPersona;
  speechRate: number;
  isOpen: boolean;
  onClose: () => void;
}

interface DoubtMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isSpoken?: boolean;
}

function makeDoubtId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const QUICK_QUESTIONS: Record<Language, string[]> = {
  en: [
    'Can you give another real-life example?',
    'Please explain this step in simpler words.',
    'Why is this concept important to learn?',
  ],
  hi: [
    'क्या आप एक और दैनिक जीवन का उदाहरण दे सकते हैं?',
    'कृपया इस चरण को और सरल शब्दों में समझाएं।',
    'यह विषय सीखना क्यों महत्वपूर्ण है?',
  ],
  mr: [
    'तुम्ही अजून एक दैनंदिन जीवनातील उदाहरण देऊ शकता का?',
    'कृपया ही पायरी अजून सोप्या शब्दांत समजावून सांगा.',
    'हा घटक शिकणे का महत्त्वाचे आहे?',
  ],
};

export default function InLessonDoubt({
  lessonId,
  lessonTitle,
  subjectName,
  currentSectionTitle,
  relevantContent,
  language,
  teacherPersona,
  speechRate,
  isOpen,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Initialize welcoming greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMap = {
        en: `Hi! I'm here to help with **${currentSectionTitle || lessonTitle}**. What doubt do you have?`,
        hi: `नमस्ते! मैं **${currentSectionTitle || lessonTitle}** में आपकी सहायता के लिए यहाँ हूँ। आपकी क्या शंका है?`,
        mr: `नमस्कार! मी **${currentSectionTitle || lessonTitle}** मधील तुमची शंका सोडवण्यासाठी येथे आहे. काय विचारायचे आहे?`,
      };
      const timer = setTimeout(() => {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: welcomeMap[language] || welcomeMap.en,
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentSectionTitle, lessonTitle, language, messages.length]);

  // Clean up speech on close
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      const timer = setTimeout(() => {
        setIsSpeakingAnswer(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendQuestion = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: DoubtMessage = {
      id: makeDoubtId('u'),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const history = messages
      .filter((m) => m.id !== 'welcome' && !m.id.startsWith('err'))
      .map((m) => ({ role: m.role, content: m.text }));
    const payloadMessages = [...history, { role: 'user' as const, content: textToSend }];

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setSpeechError(null);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          language,
          lessonContext: {
            lessonId,
            lessonTitle,
            subjectName,
            currentSection: currentSectionTitle,
            relevantContent,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const botMsg: DoubtMessage = {
        id: makeDoubtId('a'),
        role: 'assistant',
        text: data.reply || 'Here to help!',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Automatically speak the response
      speakText({
        text: botMsg.text,
        lang: language,
        persona: teacherPersona,
        rate: speechRate,
        onStart: () => setIsSpeakingAnswer(true),
        onEnd: () => setIsSpeakingAnswer(false),
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Could not get an answer.';
      const fallbackMap = {
        en: `⚠️ Notice: ${errorMsg}\n\nTip: You can re-read "${currentSectionTitle || lessonTitle}" in the lesson player or retry your question.`,
        hi: `⚠️ सूचना: ${errorMsg}\n\nसुझाव: आप पाठ में "${currentSectionTitle || lessonTitle}" को पुनः पढ़ सकते हैं या अपना प्रश्न पुनः पूछ सकते हैं।`,
        mr: `⚠️ सूचना: ${errorMsg}\n\nटीप: तुम्ही धड्यातील "${currentSectionTitle || lessonTitle}" पुन्हा वाचू शकता किंवा प्रश्न पुन्हा विचारू शकता.`,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: makeDoubtId('err'),
          role: 'assistant',
          text: fallbackMap[language] || fallbackMap.en,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Voice Speech Recognition for questions
  const toggleSpeechRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your doubt below.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      language,
      (transcript) => {
        setInput(transcript);
      },
      (errMsg) => {
        setSpeechError(errMsg);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      setIsListening(true);
      setSpeechError(null);
      recognizer.start();
    }
  };

  const handleToggleSpeakLast = (text: string) => {
    if (isSpeakingAnswer) {
      stopSpeaking();
      setIsSpeakingAnswer(false);
    } else {
      speakText({
        text,
        lang: language,
        persona: teacherPersona,
        rate: speechRate,
        onStart: () => setIsSpeakingAnswer(true),
        onEnd: () => setIsSpeakingAnswer(false),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-label={t('doubtAssistantTitle', language)}
      aria-modal="true"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                {t('doubtAssistantTitle', language)}
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </h3>
              <p className="text-[11px] text-violet-200 mt-0.5 line-clamp-1">
                {currentSectionTitle || lessonTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label={t('closeDoubtBtn', language)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-violet-50/70 border-b border-violet-100 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-violet-700 whitespace-nowrap">💡 Quick:</span>
          {QUICK_QUESTIONS[language]?.map((qText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(qText)}
              disabled={loading}
              className="text-xs bg-white text-slate-700 hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px] max-h-[380px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.role === 'assistant' && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleToggleSpeakLast(msg.text)}
                      className="ml-2 hover:text-violet-600 flex items-center gap-1 p-1 rounded"
                      title={isSpeakingAnswer ? 'Stop audio' : 'Listen audio'}
                    >
                      {isSpeakingAnswer ? <VolumeX className="w-3.5 h-3.5 text-violet-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <Card className="px-3.5 py-2 inline-flex items-center gap-2 bg-slate-50">
                <ThinkingDots />
              </Card>
            </div>
          )}
        </div>

        {/* Speech Error Notice */}
        {speechError && (
          <div className="bg-amber-50 px-4 py-1.5 text-xs text-amber-800 flex items-center gap-2 border-t border-amber-100">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Input & Microphone Bar */}
        <div className="p-3 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? t('listeningNow', language) : t('doubtInputPlaceholder', language)}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  isListening ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                }`}
              />
              {isListening && (
                <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                </span>
              )}
            </div>

            <Button
              type="button"
              variant={isListening ? 'danger' : 'secondary'}
              size="md"
              onClick={toggleSpeechRecognition}
              aria-label={isListening ? t('stopListening', language) : t('voiceInputBtn', language)}
              title={isListening ? 'Stop listening' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-violet-600" />}
            </Button>

            <Button
              type="submit"
              disabled={!input.trim() || loading}
              size="md"
              aria-label={t('sendDoubtBtn', language)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-2 flex justify-between items-center text-[11px] text-slate-400">
            <span>💡 Answers are grounded in this active lesson.</span>
            <button
              onClick={onClose}
              className="font-semibold text-violet-600 hover:underline"
            >
              {t('closeDoubtBtn', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
