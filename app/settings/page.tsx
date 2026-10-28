'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { Card, SectionTitle, Button, Badge } from '@/components/ui';
import {
  loadProgress,
  saveStudentName,
  saveTeacherPersona,
  saveSpeechRate,
  resetProgress,
  isStorageAvailable,
} from '@/lib/progress';
import { LANGUAGES, t } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import VirtualTeacherAvatar from '@/components/VirtualTeacherAvatar';
import {
  User,
  Trash2,
  Info,
  HelpCircle,
  Languages,
  Gauge,
  Sparkles,
} from 'lucide-react';
import type { Language, TeacherPersona } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState<TeacherPersona>('female');
  const [speechRate, setSpeechRateState] = useState<number>(1);
  const [savedName, setSavedName] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStorageOk(isStorageAvailable());
      const p = loadProgress();
      setName(p.studentName);
      setTeacher(p.teacherPersona || 'female');
      setSpeechRateState(p.speechRate || 1);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveName = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveStudentName(trimmed);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 2000);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
  };

  const handleTeacherChange = (newTeacher: TeacherPersona) => {
    setTeacher(newTeacher);
    saveTeacherPersona(newTeacher);
  };

  const handleSpeedChange = (rate: number) => {
    setSpeechRateState(rate);
    saveSpeechRate(rate);
  };

  const handleReset = () => {
    resetProgress();
    setResetConfirm(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Settings & Help</h1>
          <p className="text-slate-500 text-sm mt-1">Personalise your learning experience</p>
        </div>

        {/* ── Student Profile ─────────────────────────────────── */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-violet-600" />
            <SectionTitle>Your Name</SectionTitle>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Enter your name"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              aria-label="Your name"
              maxLength={40}
            />
            <Button onClick={handleSaveName} disabled={!name.trim()} size="md">
              {savedName ? '✓ Saved!' : 'Save'}
            </Button>
          </div>
        </Card>

        {/* ── Learning Language Preference ────────────────────── */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5 text-violet-600" />
            <SectionTitle>Preferred Learning Language</SectionTitle>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Choose the language for lesson explanations, teacher voice narration, short notes, and quizzes.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {LANGUAGES.map((l) => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{l.flag}</div>
                  <div className="text-sm font-bold">{l.nativeName}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{l.name}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Virtual Teacher Persona ────────────────────────── */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <SectionTitle>Virtual AI Teacher</SectionTitle>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Choose who teaches your video-style animated lessons.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTeacherChange('female')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                teacher === 'female'
                  ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-xs ring-2 ring-violet-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <VirtualTeacherAvatar persona="female" isSpeaking={false} size="md" />
              <div className="text-sm font-bold mt-1">{t('ananyaMaam', lang)}</div>
              <Badge color={teacher === 'female' ? 'violet' : 'slate'}>Friendly & Encouraging</Badge>
            </button>

            <button
              onClick={() => handleTeacherChange('male')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                teacher === 'male'
                  ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-xs ring-2 ring-violet-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <VirtualTeacherAvatar persona="male" isSpeaking={false} size="md" />
              <div className="text-sm font-bold mt-1">{t('rahulSir', lang)}</div>
              <Badge color={teacher === 'male' ? 'violet' : 'slate'}>Clear & Systematic</Badge>
            </button>
          </div>
        </Card>

        {/* ── Voice Narration Speed ──────────────────────────── */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-5 h-5 text-violet-600" />
            <SectionTitle>Voice Narration Speed</SectionTitle>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Adjust how fast your teacher reads lesson steps and answers aloud.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '0.75x Slower', value: 0.75 },
              { label: '1.0x Normal', value: 1.0 },
              { label: '1.25x Faster', value: 1.25 },
            ].map((spd) => {
              const isSelected = speechRate === spd.value;
              return (
                <button
                  key={spd.value}
                  onClick={() => handleSpeedChange(spd.value)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-violet-600 bg-violet-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {spd.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Comprehensive Help Section ─────────────────────── */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <SectionTitle>How ShikshaMitra AI Works</SectionTitle>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-slate-600">
            <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 flex items-start gap-3">
              <span className="text-xl">👩‍🏫</span>
              <div>
                <strong className="text-slate-800">1. Virtual AI Teacher & Animated Lessons</strong>
                <p className="mt-0.5 text-slate-600">
                  Click on any lesson to learn step-by-step. Ananya Ma&apos;am or Rahul Sir will narrate the lesson in English, Hindi, or Marathi with synced visual models.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <span className="text-xl">❓</span>
              <div>
                <strong className="text-slate-800">2. In-Lesson Doubt Assistant</strong>
                <p className="mt-0.5 text-slate-600">
                  Got stuck on a step? Click &quot;Ask Doubt&quot; right inside the lesson. You can type or use your microphone, and your teacher will answer without losing your place!
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
              <span className="text-xl">🎙️</span>
              <div>
                <strong className="text-slate-800">3. Voice Q&A with AI Tutor</strong>
                <p className="mt-0.5 text-slate-600">
                  Visit the AI Tutor page and click the microphone button to ask questions by speaking in English, Hindi, or Marathi. Click &quot;Read Aloud&quot; to hear answers spoken back.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
              <span className="text-xl">📄</span>
              <div>
                <strong className="text-slate-800">4. Learn from Your Own PDF</strong>
                <p className="mt-0.5 text-slate-600">
                  Upload textbook chapters, school notes, or homework worksheets in &quot;My PDFs&quot;. ShikshaMitra AI extracts the text and creates simple explanations, short notes, real-life examples, and practice quizzes.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <strong className="text-slate-800">5. Offline Learning Supported</strong>
                <p className="mt-0.5 text-slate-600">
                  All bundled lessons, audio speech, quizzes, and short notes work completely offline without an internet connection.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Storage notice ─────────────────────────────────── */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <SectionTitle>About Your Progress Storage</SectionTitle>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-slate-600">
            <p>• Your learning streak, quiz attempts, and uploaded PDFs are saved safely in <strong>this browser on this device</strong>.</p>
            <p>• No login account required — no personal data is collected or transmitted to external tracking servers.</p>
            {!storageOk && (
              <p className="text-amber-700 bg-amber-50 rounded-lg p-3 mt-2">
                ⚠️ Your browser does not support local storage. Progress cannot be saved.
              </p>
            )}
          </div>
        </Card>

        {/* ── Danger zone: Reset Progress ────────────────────── */}
        <Card className="p-5 border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <SectionTitle>Reset Learning Progress</SectionTitle>
          </div>
          <p className="text-xs md:text-sm text-slate-600 mb-4">
            This will permanently delete all your saved lessons, quiz scores, uploaded documents, and streaks.
          </p>
          {!resetConfirm ? (
            <Button variant="danger" onClick={() => setResetConfirm(true)}>
              Reset All Progress
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700">Are you sure? This will erase everything!</p>
              <div className="flex gap-3">
                <Button variant="danger" onClick={handleReset}>Yes, Delete Everything</Button>
                <Button variant="secondary" onClick={() => setResetConfirm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
