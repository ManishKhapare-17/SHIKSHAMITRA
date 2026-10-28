// ============================================================
// ShikshaMitra AI — Video-Style Animated Lesson Player
// Upgraded with Live Speed Control, Checkpoint Resumption,
// Multilingual Narration, and Floating AI Teacher Panel
// ============================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Play, Pause, RotateCcw, Volume2, ChevronRight, ChevronLeft,
  BookOpen, HelpCircle, CheckCircle, ArrowLeft,
  FileText, Sparkles, AlertCircle, Maximize2, Minimize2,
  BookmarkCheck
} from 'lucide-react';
import { Button, Badge, Card } from './ui';
import VirtualTeacherAvatar, { type TeacherSpeechState } from './VirtualTeacherAvatar';
import InLessonDoubt from './InLessonDoubt';
import { FractionDiagram, WaterCycleDiagram, NounDiagram } from './LessonVisuals';
import type { Lesson, Language, TeacherPersona } from '@/lib/types';
import { SUBJECT_MAP } from '@/lib/subjects';
import { t, LANGUAGES } from '@/lib/i18n';
import {
  speakText,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  isSpeechSynthesisSupported,
  getLastSpokenCharIndex,
  getVoiceStatus,
} from '@/lib/speech';
import {
  markLessonStarted,
  markLessonCompleted,
  isLessonCompleted,
  getTeacherPersona,
  saveTeacherPersona,
  getSpeechRate,
  saveSpeechRate,
  saveLessonCheckpoint,
  getLessonCheckpoint,
} from '@/lib/progress';
import { useLanguage } from '@/lib/LanguageContext';

interface Props {
  lesson: Lesson;
  documentContextText?: string;
}

type ViewMode = 'video' | 'notes';
type TeacherPanelMode = 'compact' | 'expanded' | 'minimized';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const VISUAL_COMPONENTS: Record<string, React.FC> = {
  'math-fractions-g4': FractionDiagram,
  'sci-water-cycle-g4': WaterCycleDiagram,
  'eng-nouns-g4': NounDiagram,
};

export default function VideoLessonPlayer({ lesson, documentContextText }: Props) {
  const subject = SUBJECT_MAP[lesson.subjectId] ?? {
    id: lesson.subjectId,
    name: 'Document Lesson',
    nameTranslations: { en: 'Document Lesson', hi: 'दस्तावेज़ पाठ', mr: 'दस्तऐवज धडा' },
    grade: 4,
    description: 'Document Learning',
    descriptionTranslations: { en: 'Document Learning', hi: 'दस्तावेज़ शिक्षण', mr: 'दस्तऐवज शिक्षण' },
    color: 'violet' as const,
    icon: 'FileText',
    lessonIds: [],
  };
  const { language, setLanguage } = useLanguage();
  const [teacherPersona, setTeacherPersona] = useState<TeacherPersona>('female');
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [teacherState, setTeacherState] = useState<TeacherSpeechState>('idle');
  const [teacherPanelMode, setTeacherPanelMode] = useState<TeacherPanelMode>('compact');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);
  const [wasPlayingBeforeDoubt, setWasPlayingBeforeDoubt] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [checkpointNotice, setCheckpointNotice] = useState<string | null>(null);
  const [translationsCache, setTranslationsCache] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Knowledge check state
  const [knowledgeCheckSelected, setKnowledgeCheckSelected] = useState<number | null>(null);
  const [knowledgeCheckSubmitted, setKnowledgeCheckSubmitted] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const totalSteps = lesson.steps.length;

  // Initialize from storage & restore checkpoint
  useEffect(() => {
    const timer = setTimeout(() => {
      const preferredPersona = getTeacherPersona();
      const preferredRate = getSpeechRate();
      const isDone = isLessonCompleted(lesson.id);

      setTeacherPersona(preferredPersona);
      setAlreadyCompleted(isDone);
      markLessonStarted(lesson.id, lesson.subjectId, lesson.grade);

      // Checkpoint resumption
      const savedCheckpoint = getLessonCheckpoint(lesson.id);
      if (savedCheckpoint) {
        const safeStep =
          typeof savedCheckpoint.stepIndex === 'number' &&
          savedCheckpoint.stepIndex >= 0 &&
          savedCheckpoint.stepIndex < totalSteps
            ? savedCheckpoint.stepIndex
            : 0;

        setCurrentStepIndex(safeStep);
        setSpeechRate(savedCheckpoint.playbackSpeed || preferredRate);

        if (safeStep > 0) {
          setCheckpointNotice(`Resumed from checkpoint: Step ${safeStep + 1}`);
          const noticeTimer = setTimeout(() => setCheckpointNotice(null), 3500);
          return () => clearTimeout(noticeTimer);
        }
      } else {
        setSpeechRate(preferredRate);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson.id, lesson.subjectId, lesson.grade, totalSteps]);

  // Periodic checkpoint saver helper
  const persistCurrentCheckpoint = useCallback(
    (stepIdx: number, speed: number, lang: Language, playing: boolean, charIdx: number = 0) => {
      saveLessonCheckpoint({
        lessonId: lesson.id,
        stepIndex: stepIdx,
        charIndex: charIdx,
        playbackSpeed: speed,
        language: lang,
        isPlaying: playing,
        lastUpdatedAt: new Date().toISOString(),
      });
    },
    [lesson.id]
  );

  // Save checkpoint on unload / navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistCurrentCheckpoint(
        currentStepIndex,
        speechRate,
        language,
        isPlaying,
        currentCharIndex
      );
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStepIndex, speechRate, language, isPlaying, currentCharIndex, persistCurrentCheckpoint]);

  // Dynamic translation when switching to Hindi/Marathi and pre-translated narration is not in Devanagari
  useEffect(() => {
    if (language === 'en') return;
    const step = lesson.steps[currentStepIndex];
    if (!step) return;

    const key = `${currentStepIndex}_${language}`;
    if (translationsCache[key]) return;

    const preTranslated = step.narrationText?.[language] || step.contentTranslations?.[language];
    if (preTranslated && /[\u0900-\u097F]/.test(preTranslated)) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsTranslating(true);
    }, 0);

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: step.content || step.narrationText?.en || lesson.title,
        targetLanguage: language,
        sourceLanguage: 'en',
        context: `Lesson title: ${lesson.title}, Step ${currentStepIndex + 1}: ${step.title}`,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.translatedText) {
          setTranslationsCache((prev) => ({
            ...prev,
            [key]: data.translatedText,
          }));
        }
      })
      .catch((err) => {
        console.warn('[VideoLessonPlayer] Dynamic translation failed:', err);
      })
      .finally(() => {
        if (!cancelled) setIsTranslating(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [language, currentStepIndex, lesson.steps, lesson.title, translationsCache]);

  // Current localized text helpers
  const localizedTitle = lesson.titleTranslations?.[language] || lesson.title;
  const currentStep = lesson.steps[currentStepIndex] || lesson.steps[0];
  const localizedStepTitle = currentStep?.titleTranslations?.[language] || currentStep?.title || 'Step';

  const cachedNarration = translationsCache[`${currentStepIndex}_${language}`];
  const preTranslatedNarration =
    currentStep?.narrationText?.[language] || currentStep?.contentTranslations?.[language];

  const localizedNarration =
    language === 'en'
      ? currentStep?.narrationText?.en || currentStep?.contentTranslations?.en || currentStep?.content || ''
      : preTranslatedNarration && /[\u0900-\u097F]/.test(preTranslatedNarration)
      ? preTranslatedNarration
      : cachedNarration
      ? cachedNarration
      : language === 'hi'
      ? `नमस्ते बच्चों! आज हम ${lesson.titleTranslations?.hi || lesson.title} के बारे में समझ रहे हैं।`
      : `नमस्कार मुलांनो! आज आपण ${lesson.titleTranslations?.mr || lesson.title} बद्दल शिकत आहोत.`;

  const localizedExample = currentStep?.exampleTranslations?.[language] || currentStep?.example;

  // Narration playback function supporting live start character offset
  const playNarration = useCallback(
    (customRate?: number, startCharOffset: number = 0) => {
      if (!isSpeechSynthesisSupported()) {
        setAudioError('Voice narration is not supported by your browser. Please read the captions below.');
        setTeacherState('error');
        return;
      }

      // Check native voice availability for Hindi and Marathi
      const vStatus = getVoiceStatus(language);
      if (language !== 'en' && !vStatus.available) {
        setAudioError(
          vStatus.message ||
            `A native ${language === 'hi' ? 'Hindi' : 'Marathi'} voice is not installed on this browser. Complete ${language === 'hi' ? 'Hindi' : 'Marathi'} captions and text are displayed below so you can read along.`
        );
        setIsPlaying(false);
        setTeacherState('idle');
        return;
      }

      setAudioError(null);
      setIsPlaying(true);
      setTeacherState('speaking');

      const activeRate = customRate !== undefined ? customRate : speechRate;

      const success = speakText({
        text: localizedNarration,
        lang: language,
        persona: teacherPersona,
        rate: activeRate,
        startCharIndex: startCharOffset,
        onStart: () => {
          setIsPlaying(true);
          setTeacherState('speaking');
        },
        onEnd: () => {
          setIsPlaying(false);
          setTeacherState('idle');
          setCurrentCharIndex(0);
          persistCurrentCheckpoint(currentStepIndex, activeRate, language, false, 0);
        },
        onPause: () => {
          setTeacherState('paused');
        },
        onResume: () => {
          setTeacherState('speaking');
        },
        onBoundary: (charIdx) => {
          setCurrentCharIndex(charIdx);
        },
        onError: (err) => {
          setAudioError(err);
          setIsPlaying(false);
          setTeacherState('idle');
        },
      });

      if (!success) {
        setIsPlaying(false);
        setTeacherState('idle');
      }
    },
    [localizedNarration, language, teacherPersona, speechRate, currentStepIndex, persistCurrentCheckpoint]
  );

  // Live Playback Speed Change (continues immediately from current word position)
  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    saveSpeechRate(newRate);

    if (isPlaying) {
      // Get exact position reached in narration
      const charOffset = getLastSpokenCharIndex();
      stopSpeaking();
      playNarration(newRate, charOffset);
    }

    persistCurrentCheckpoint(currentStepIndex, newRate, language, isPlaying, currentCharIndex);
  };

  // Language Change during playback (resumes corresponding step narration immediately without reset)
  const handleLanguageChange = (newLang: Language) => {
    const wasActive = isPlaying;
    stopSpeaking();
    setLanguage(newLang);
    setCurrentCharIndex(0);
    setAudioError(null);

    persistCurrentCheckpoint(currentStepIndex, speechRate, newLang, wasActive, 0);

    const vStatus = getVoiceStatus(newLang);
    if (newLang !== 'en' && !vStatus.available) {
      setAudioError(
        vStatus.message ||
          `A native ${newLang === 'hi' ? 'Hindi' : 'Marathi'} voice was not detected on this browser. Complete Devanagari captions are displayed below so you can read along.`
      );
      setIsPlaying(false);
      setTeacherState('idle');
      return;
    }

    if (wasActive) {
      const step = lesson.steps[currentStepIndex] || lesson.steps[0];
      const preTranslated = step.narrationText?.[newLang] || step.contentTranslations?.[newLang];
      const cached = translationsCache[`${currentStepIndex}_${newLang}`];
      const nextNarration =
        newLang === 'en'
          ? step.narrationText?.en || step.contentTranslations?.en || step.content || ''
          : preTranslated && /[\u0900-\u097F]/.test(preTranslated)
          ? preTranslated
          : cached
          ? cached
          : newLang === 'hi'
          ? `नमस्ते बच्चों! आज हम ${lesson.titleTranslations?.hi || lesson.title} के बारे में समझ रहे हैं।`
          : `नमस्कार मुलांनो! आज आपण ${lesson.titleTranslations?.mr || lesson.title} बद्दल शिकत आहोत.`;

      setIsPlaying(true);
      setTeacherState('speaking');

      speakText({
        text: nextNarration,
        lang: newLang,
        persona: teacherPersona,
        rate: speechRate,
        startCharIndex: 0,
        onStart: () => {
          setIsPlaying(true);
          setTeacherState('speaking');
        },
        onEnd: () => {
          setIsPlaying(false);
          setTeacherState('idle');
          setCurrentCharIndex(0);
        },
        onBoundary: (idx) => setCurrentCharIndex(idx),
        onError: (err) => {
          setAudioError(err);
          setIsPlaying(false);
          setTeacherState('idle');
        },
      });
    } else {
      setIsPlaying(false);
      setTeacherState('idle');
    }
  };

  // Teacher persona switch
  const handleTeacherChange = (newPersona: TeacherPersona) => {
    const wasActive = isPlaying;
    stopSpeaking();
    setTeacherPersona(newPersona);
    saveTeacherPersona(newPersona);

    if (wasActive) {
      const charOffset = getLastSpokenCharIndex();
      playNarration(speechRate, charOffset);
    } else {
      setIsPlaying(false);
      setTeacherState('idle');
    }
  };

  // Play / Pause Toggle
  const togglePlayNarration = () => {
    if (isPlaying) {
      if (teacherState === 'paused') {
        resumeSpeaking();
        setTeacherState('speaking');
      } else {
        pauseSpeaking();
        setTeacherState('paused');
      }
    } else {
      playNarration(speechRate, currentCharIndex);
    }
  };

  // Full Step Replay
  const handleReplay = () => {
    stopSpeaking();
    setCurrentCharIndex(0);
    playNarration(speechRate, 0);
  };

  // Step Switch (clean audio reset, preserve speed & language)
  const handleStepChange = (newStep: number) => {
    stopSpeaking();
    setIsPlaying(false);
    setTeacherState('idle');
    setCurrentCharIndex(0);
    setCurrentStepIndex(newStep);
    persistCurrentCheckpoint(newStep, speechRate, language, false, 0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      handleStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      handleStepChange(currentStepIndex - 1);
    }
  };

  // In-Lesson Doubt Flow: pauses playback & restores position upon close
  const handleOpenDoubt = () => {
    setWasPlayingBeforeDoubt(isPlaying);
    if (isPlaying) {
      pauseSpeaking();
      setIsPlaying(false);
      setTeacherState('paused');
    }
    setIsDoubtOpen(true);
  };

  const handleCloseDoubt = () => {
    setIsDoubtOpen(false);
    if (wasPlayingBeforeDoubt) {
      resumeSpeaking();
      setIsPlaying(true);
      setTeacherState('speaking');
    }
  };

  const handleComplete = () => {
    markLessonCompleted(lesson.id);
    setAlreadyCompleted(true);
  };

  const VisualModel = VISUAL_COMPONENTS[lesson.id];
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in relative">
      {/* Checkpoint Resumption Pill */}
      {checkpointNotice && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-2 animate-bounce">
          <BookmarkCheck className="w-4 h-4" />
          <span>{checkpointNotice}</span>
        </div>
      )}

      {/* Top Breadcrumb & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/subjects/${lesson.subjectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {subject.nameTranslations?.[language] || subject.name}
        </Link>

        {/* Language & Teacher Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Trilingual Language Selector */}
          <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
            {LANGUAGES.map((langOpt) => (
              <button
                key={langOpt.code}
                onClick={() => handleLanguageChange(langOpt.code)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === langOpt.code
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                title={langOpt.name}
              >
                {langOpt.nativeName}
              </button>
            ))}
          </div>

          {/* Teacher Persona Selector */}
          <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
            <button
              onClick={() => handleTeacherChange('female')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                teacherPersona === 'female'
                  ? 'bg-purple-100 text-purple-800 font-bold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
              title="Ananya Ma'am"
            >
              👩‍🏫 {t('ananyaMaam', language)}
            </button>
            <button
              onClick={() => handleTeacherChange('male')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                teacherPersona === 'male'
                  ? 'bg-blue-100 text-blue-800 font-bold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
              title="Rahul Sir"
            >
              👨‍🏫 {t('rahulSir', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Title & Mode Switch Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge color={lesson.subjectId === 'mathematics' ? 'blue' : lesson.subjectId === 'science' ? 'green' : 'violet'}>
              {subject.emoji} {subject.nameTranslations?.[language] || subject.name}
            </Badge>
            <Badge color="slate">Grade {lesson.grade}</Badge>
            {alreadyCompleted && (
              <Badge color="green">
                <CheckCircle className="w-3 h-3" /> {t('completedBadge', language)}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {localizedTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {lesson.summaryTranslations?.[language] || lesson.summary}
          </p>
        </div>

        {/* Mode Toggle (Interactive Animated Lesson vs Short Notes) */}
        <div className="flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setViewMode('video')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'video'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {t('videoLessonMode', language)}
          </button>
          <button
            onClick={() => setViewMode('notes')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'notes'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('notesMode', language)}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 1: INTERACTIVE ANIMATED LESSON PLAYER            */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'video' && (
        <div className="space-y-5">
          {/* Main Animated Lesson Player Container */}
          <div
            ref={videoContainerRef}
            className="rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden border border-slate-800 relative"
          >
            {/* Top Stage Header Bar */}
            <div className="px-5 py-3 bg-slate-950/70 backdrop-blur-xs flex items-center justify-between border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-300">
                  Step {currentStepIndex + 1} of {totalSteps}: {localizedStepTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  {teacherPersona === 'female' ? t('ananyaMaam', language) : t('rahulSir', language)}
                </span>
              </div>
            </div>

            {/* Video Stage Area with Visual Diagram & Overlay */}
            <div className="p-6 md:p-8 min-h-[300px] sm:min-h-[360px] flex flex-col items-center justify-center bg-radial from-slate-800/90 to-slate-950 relative">
              {/* Dynamic Visual Model Screen */}
              <div className="w-full max-w-xl bg-slate-900/90 rounded-2xl p-6 border border-slate-700/60 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
                {VisualModel && <VisualModel />}
                {localizedExample && (
                  <div className="mt-4 text-center bg-white/10 rounded-xl px-4 py-2.5 border border-white/10 max-w-md w-full">
                    <span className="text-amber-300 text-xs font-bold block mb-0.5">🌟 Real-life Example:</span>
                    <span className="text-slate-200 text-xs leading-relaxed">{localizedExample}</span>
                  </div>
                )}
              </div>

              {/* ────────────────────────────────────────────────────── */}
              {/* FLOATING AI TEACHER PANEL (Bottom-Right of Lesson)     */}
              {/* ────────────────────────────────────────────────────── */}
              <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end">
                {teacherPanelMode === 'expanded' ? (
                  /* Expanded Floating Panel */
                  <div className="bg-slate-950/90 backdrop-blur-md border border-violet-500/40 rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-2 w-44 animate-in fade-in zoom-in-95">
                    <div className="w-full flex items-center justify-between pb-1 border-b border-white/10 text-[11px]">
                      <span className="font-bold text-violet-300">
                        {teacherPersona === 'female' ? t('ananyaMaam', language) : t('rahulSir', language)}
                      </span>
                      <button
                        onClick={() => setTeacherPanelMode('compact')}
                        className="text-slate-400 hover:text-white p-0.5"
                        title="Minimize"
                        aria-label="Minimize teacher view"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <VirtualTeacherAvatar
                      persona={teacherPersona}
                      speechState={teacherState}
                      size="lg"
                    />

                    <div className="text-center w-full">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {teacherState === 'speaking'
                          ? 'Narrating Step'
                          : teacherState === 'paused'
                          ? 'Paused'
                          : 'Listening / Ready'}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleOpenDoubt}
                      className="w-full text-[11px] py-1 bg-violet-600/30 text-violet-200 border-violet-500/30 hover:bg-violet-600/50"
                    >
                      <HelpCircle className="w-3 h-3" /> Ask Doubt
                    </Button>
                  </div>
                ) : teacherPanelMode === 'compact' ? (
                  /* Compact Floating Badge */
                  <div className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2 shadow-xl flex items-center gap-2.5 transition-all hover:border-violet-500/50">
                    <VirtualTeacherAvatar
                      persona={teacherPersona}
                      speechState={teacherState}
                      size="sm"
                      onClick={() => setTeacherPanelMode('expanded')}
                    />
                    <div className="text-left pr-1">
                      <div className="text-xs font-bold text-violet-300 flex items-center gap-1">
                        <span>{teacherPersona === 'female' ? t('ananyaMaam', language) : t('rahulSir', language)}</span>
                        <button
                          onClick={() => setTeacherPanelMode('expanded')}
                          className="text-slate-400 hover:text-white p-0.5"
                          title="Expand view"
                          aria-label="Expand teacher view"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {teacherState === 'speaking' ? 'Speaking...' : 'Ready to help'}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Minimized Floating Pill */
                  <button
                    onClick={() => setTeacherPanelMode('compact')}
                    className="w-12 h-12 rounded-full bg-violet-600 text-white shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    title="Open Virtual Teacher"
                    aria-label="Open Virtual Teacher"
                  >
                    👩‍🏫
                  </button>
                )}
              </div>
            </div>

            {/* Read-Along Synced Captions Subtitle Box */}
            <div className="px-6 py-4 bg-slate-950/95 border-t border-slate-800/80">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-violet-300">Teacher Narration & Captions:</p>
                    {isTranslating && (
                      <span className="text-[10px] text-violet-400 flex items-center gap-1 font-semibold animate-pulse">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Translating to {language === 'hi' ? 'Hindi' : 'Marathi'}...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {localizedNarration}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="px-5 py-3.5 bg-slate-900 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              {/* Playback Controls & Speed Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={togglePlayNarration}
                  className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md transition-all active:scale-95"
                  aria-label={isPlaying ? t('pauseNarration', language) : t('listenNarration', language)}
                  title={isPlaying ? 'Pause narration' : 'Play narration'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={handleReplay}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                  title="Replay step from beginning"
                  aria-label={t('replayNarration', language)}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* 6 Playback Speeds: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x */}
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 ml-1">
                  {PLAYBACK_SPEEDS.map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-1 text-[11px] font-bold rounded transition-colors ${
                        speechRate === spd
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={`Playback speed ${spd}x`}
                      aria-label={`Playback speed ${spd}x`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentStepIndex === 0}
                  onClick={handlePrevStep}
                  className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev Step
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={currentStepIndex === totalSteps - 1}
                  onClick={handleNextStep}
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Video Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Audio Error Banner */}
          {audioError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{audioError}</span>
            </div>
          )}

          {/* In-Lesson Action Floating Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenDoubt}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md"
              >
                <HelpCircle className="w-4 h-4" />
                {t('askDoubtBtn', language)}
              </Button>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Have a question? Ask our AI Tutor without losing your place.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/quiz/${lesson.id}`}>
                <Button variant="secondary" size="md">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {t('practiceQuizBtn', language)}
                </Button>
              </Link>
              {!alreadyCompleted && (
                <Button variant="secondary" size="md" onClick={handleComplete}>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {t('markCompleteBtn', language)}
                </Button>
              )}
            </div>
          </div>

          {/* Interactive Knowledge Check at bottom of lesson */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center font-black text-violet-700 text-sm">
                ?
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {t('quickKnowledgeCheck', language)}
              </h3>
            </div>

            <p className="font-semibold text-slate-800 text-sm mb-4">
              {lesson.knowledgeCheck.questionTranslations?.[language] || lesson.knowledgeCheck.question}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(lesson.knowledgeCheck.optionsTranslations?.[language] || lesson.knowledgeCheck.options).map((optText, idx) => {
                const isSelected = knowledgeCheckSelected === idx;
                const isCorrect = idx === lesson.knowledgeCheck.correctIndex;
                let btnCls = 'text-left p-3.5 rounded-xl border-2 text-sm font-medium transition-all ';

                if (!knowledgeCheckSubmitted) {
                  btnCls += isSelected
                    ? 'border-violet-500 bg-violet-50 text-violet-900'
                    : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50 text-slate-700';
                } else {
                  if (isCorrect) btnCls += 'border-green-500 bg-green-50 text-green-900 font-bold';
                  else if (isSelected) btnCls += 'border-red-400 bg-red-50 text-red-900';
                  else btnCls += 'border-slate-100 text-slate-400';
                }

                return (
                  <button
                    key={idx}
                    disabled={knowledgeCheckSubmitted}
                    onClick={() => setKnowledgeCheckSelected(idx)}
                    className={btnCls}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Actions */}
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              {!knowledgeCheckSubmitted ? (
                <Button
                  size="sm"
                  disabled={knowledgeCheckSelected === null}
                  onClick={() => setKnowledgeCheckSubmitted(true)}
                >
                  {t('submitAnswer', language)}
                </Button>
              ) : (
                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800 mb-1">
                    {knowledgeCheckSelected === lesson.knowledgeCheck.correctIndex ? '🎉 Correct!' : '📚 Explanation:'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {lesson.knowledgeCheck.explanationTranslations?.[language] || lesson.knowledgeCheck.explanation}
                  </p>
                </div>
              )}

              {knowledgeCheckSubmitted && (
                <Link href={`/quiz/${lesson.id}`}>
                  <Button size="sm">
                    {t('practiceQuizBtn', language)} →
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* VIEW MODE 2: SHORT REVISION NOTES & SUMMARIES              */}
      {/* ────────────────────────────────────────────────────────── */}
      {viewMode === 'notes' && (
        <div className="space-y-5 animate-fade-in">
          {lesson.shortNotes && (
            <>
              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-br from-violet-50/60 to-purple-50/40 border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  <h3 className="font-bold text-slate-800 text-base">
                    {t('notesMode', language)}
                  </h3>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {lesson.shortNotes.summaryTranslations?.[language] || lesson.shortNotes.summary}
                </p>
              </Card>

              {/* Key Points */}
              <Card className="p-6">
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                  {t('keyConceptsTitle', language)}
                </h4>
                <ul className="space-y-2">
                  {(lesson.shortNotes.keyPointsTranslations?.[language] || lesson.shortNotes.keyPoints).map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Definitions */}
              <Card className="p-6">
                <h4 className="font-bold text-slate-800 text-sm mb-3">
                  📖 Important Definitions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(lesson.shortNotes.definitionsTranslations?.[language] || lesson.shortNotes.definitions).map((def, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                      <span className="text-xs font-bold text-violet-700 block mb-1">{def.term}</span>
                      <span className="text-xs text-slate-600 leading-relaxed">{def.meaning}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Must Remember Tip */}
              <div className="rounded-2xl p-4 bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <span className="font-bold block mb-0.5">Tip to Remember:</span>
                  <span>{lesson.shortNotes.rememberTipTranslations?.[language] || lesson.shortNotes.rememberTip}</span>
                </div>
              </div>
            </>
          )}

          {/* Real-life example card in notes */}
          <Card className="p-6">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">🍕</span>
              {t('realLifeExampleTitle', language)}
            </h4>
            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {lesson.realLifeExampleTranslations?.[language] || lesson.realLifeExample}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button onClick={() => setViewMode('video')} className="flex-1">
              <Play className="w-4 h-4 fill-current" /> Return to Animated Lesson
            </Button>
            <Link href={`/quiz/${lesson.id}`} className="flex-1">
              <Button variant="secondary" className="w-full">
                <Sparkles className="w-4 h-4 text-amber-500" /> Start Practice Quiz
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* In-Lesson Doubt Assistant Modal/Flyout */}
      <InLessonDoubt
        lessonId={lesson.id}
        lessonTitle={localizedTitle}
        subjectName={subject.nameTranslations?.[language] || subject.name}
        currentSectionTitle={localizedStepTitle}
        relevantContent={
          documentContextText
            ? `${localizedNarration}\n\nDocument text: ${documentContextText.slice(0, 2000)}`
            : localizedNarration
        }
        language={language}
        teacherPersona={teacherPersona}
        speechRate={speechRate}
        isOpen={isDoubtOpen}
        onClose={handleCloseDoubt}
      />
    </div>
  );
}
