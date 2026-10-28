'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  BookOpen,
  Sparkles,
  HelpCircle,
  Volume2,
  VolumeX,
  Trash2,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  FileCode,
  RotateCcw,
  ListOrdered,
  Lightbulb,
  Layers,
  Film,
} from 'lucide-react';
import NavBar from '@/components/NavBar';
import VideoLessonPlayer from '@/components/VideoLessonPlayer';
import { Button, Card, Badge, SectionTitle, ThinkingDots } from '@/components/ui';
import {
  saveDocumentLearning,
  getDocuments,
  deleteDocument,
  getTeacherPersona,
  getSpeechRate,
} from '@/lib/progress';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/lib/speech';
import { t, LANGUAGES } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import type { DocumentLearningData, QuizQuestion, Lesson } from '@/lib/types';

const PIPELINE_STAGES = [
  { id: 'reading', label: '1. Reading PDF', desc: 'Parsing PDF file structure & bytes' },
  { id: 'extracting', label: '2. Extracting text', desc: 'Reading text across document pages' },
  { id: 'ocr', label: '3. Recognizing scanned pages', desc: 'Verifying scanned images with OCR fallback' },
  { id: 'understanding', label: '4. Understanding concepts', desc: 'Comprehending Grade 4 educational ideas' },
  { id: 'scenes', label: '5. Creating lesson scenes', desc: 'Generating 3-scene video & trilingual narration' },
  { id: 'ready', label: '6. Ready to learn!', desc: 'Video lesson & practice quiz created' },
] as const;

function getStageIndex(stage: string): number {
  switch (stage) {
    case 'reading': return 0;
    case 'extracting': return 1;
    case 'ocr': return 2;
    case 'understanding': return 3;
    case 'scenes': return 4;
    case 'ready': return 5;
    default: return -1;
  }
}

function createDocumentRecord(
  fileName: string,
  fileSize: number,
  pageCount: number,
  wordCount: number,
  text: string,
  data: {
    explanation?: string;
    summary?: string;
    keyConcepts?: string[];
    realLifeExamples?: string[];
    quiz?: QuizQuestion[];
    generatedLesson?: Lesson;
  }
): DocumentLearningData {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName,
    fileSize,
    uploadedAt: new Date().toISOString(),
    extractedText: text,
    pageCount,
    wordCount,
    explanation: data.explanation,
    summary: data.summary,
    keyConcepts: data.keyConcepts,
    realLifeExamples: data.realLifeExamples,
    quiz: data.quiz,
    generatedLesson: data.generatedLesson,
  };
}

export default function DocumentsPage() {
  const { language: lang, setLanguage: setLang } = useLanguage();
  const [documents, setDocuments] = useState<DocumentLearningData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentLearningData | null>(null);

  // Upload & Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<
    'idle' | 'reading' | 'extracting' | 'ocr' | 'understanding' | 'scenes' | 'ready'
  >('idle');

  // Extracted text editing
  const [activeText, setActiveText] = useState('');
  const [activeFileName, setActiveFileName] = useState('');
  const [activeFileSize, setActiveFileSize] = useState(0);
  const [activePageCount, setActivePageCount] = useState(1);
  const [activeWordCount, setActiveWordCount] = useState(0);

  // Active view mode & tab
  const [viewMode, setViewMode] = useState<'video' | 'notes'>('video');
  const [activeTab, setActiveTab] = useState<'explanation' | 'notes' | 'concepts' | 'quiz'>('explanation');

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quiz state for current document
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const docs = getDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        setSelectedDoc(docs[0]);
        setActiveText(docs[0].extractedText);
        setActiveFileName(docs[0].fileName);
        setActiveFileSize(docs[0].fileSize);
        setActivePageCount(docs[0].pageCount);
        setActiveWordCount(docs[0].wordCount);
        setViewMode(docs[0].generatedLesson ? 'video' : 'notes');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size is larger than 10MB. Please upload a smaller document.');
      return;
    }

    setIsExtracting(true);
    setPipelineStage('reading');
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setPipelineStage('extracting');
      const res = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as {
        text?: string;
        fileName?: string;
        fileSize?: number;
        pageCount?: number;
        wordCount?: number;
        isScanned?: boolean;
        ocrApplied?: boolean;
        error?: string;
      };

      if (!res.ok || data.error) {
        setUploadError(data.error || 'Failed to extract text from this PDF.');
        setPipelineStage('idle');
        return;
      }

      setPipelineStage('idle');
      const text = data.text || '';
      setActiveText(text);
      setActiveFileName(data.fileName || file.name);
      setActiveFileSize(data.fileSize || file.size);
      setActivePageCount(data.pageCount || 1);
      setActiveWordCount(data.wordCount || 0);
      setIsReviewing(true);
    } catch {
      setUploadError('Could not upload or extract PDF. Please check your network and try again.');
      setPipelineStage('idle');
    } finally {
      setIsExtracting(false);
    }
  };

  const processDocument = async (
    text: string,
    fileName: string,
    fileSize: number,
    pageCount: number,
    wordCount: number
  ) => {
    setIsProcessing(true);
    setUploadError(null);
    setPipelineStage('understanding');

    try {
      const stageTimer = setTimeout(() => {
        setPipelineStage((current) => (current === 'understanding' ? 'scenes' : current));
      }, 1500);

      const res = await fetch('/api/pdf/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fileName,
          language: lang,
        }),
      });

      clearTimeout(stageTimer);

      const data = (await res.json()) as {
        title?: string;
        explanation?: string;
        summary?: string;
        keyConcepts?: string[];
        realLifeExamples?: string[];
        quiz?: QuizQuestion[];
        generatedLesson?: Lesson;
        error?: string;
      };

      if (!res.ok || data.error) {
        setUploadError(data.error || 'Failed to process document into learning materials.');
        setPipelineStage('idle');
        return;
      }

      const newDoc = createDocumentRecord(
        fileName,
        fileSize,
        pageCount,
        wordCount,
        text,
        data
      );

      saveDocumentLearning(newDoc);
      const updatedDocs = getDocuments();
      setDocuments(updatedDocs);
      setSelectedDoc(newDoc);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setShowQuizResults(false);
      setActiveTab('explanation');
      setViewMode(newDoc.generatedLesson ? 'video' : 'notes');

      setPipelineStage('ready');
      setTimeout(() => {
        setPipelineStage('idle');
      }, 2500);
    } catch {
      setUploadError('Failed to generate learning content from document. Please try again.');
      setPipelineStage('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSpeak = (textToSpeak: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const persona = getTeacherPersona();
    const rate = getSpeechRate();

    const ok = speakText({
      text: textToSpeak,
      lang,
      persona,
      rate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    if (!ok) {
      setIsSpeaking(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDocument(id);
    const updated = getDocuments();
    setDocuments(updated);
    if (selectedDoc?.id === id) {
      const nextDoc = updated[0] || null;
      setSelectedDoc(nextDoc);
      if (nextDoc) {
        setActiveText(nextDoc.extractedText);
        setActiveFileName(nextDoc.fileName);
        setActiveFileSize(nextDoc.fileSize);
        setActivePageCount(nextDoc.pageCount);
        setActiveWordCount(nextDoc.wordCount);
      } else {
        setActiveText('');
        setActiveFileName('');
      }
    }
  };

  // Quiz helper
  const handleSelectAnswer = (qId: string, optionId: string) => {
    if (showQuizResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  const calculateQuizScore = () => {
    if (!selectedDoc?.quiz) return 0;
    return selectedDoc.quiz.reduce((score, q) => {
      return selectedAnswers[q.id] === q.correctOptionId ? score + 1 : score;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* ── Top Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-100 text-violet-700">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-800">{t('pdfTitle', lang)}</h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">{t('pdfSubtitle', lang)}</p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm self-start sm:self-auto">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  if (activeText && activeFileName) {
                    void processDocument(
                      activeText,
                      activeFileName,
                      activeFileSize,
                      activePageCount,
                      activeWordCount
                    );
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  lang === l.code
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {l.flag} {l.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* ── Upload Box ─────────────────────────────────────── */}
        <section className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-violet-500 bg-violet-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-violet-400 bg-white hover:bg-violet-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  void handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 mb-3">
              <Upload className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-800 text-base">
              {isExtracting ? t('pdfExtracting', lang) : t('uploadPdfBtn', lang)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{t('pdfDragDrop', lang)}</p>

            {isExtracting && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-violet-700 font-semibold">
                <ThinkingDots />
                <span>Reading document text...</span>
              </div>
            )}
          </div>

          {/* Review & Edit Extracted Text Panel */}
          {isReviewing && activeText && (
            <Card className="p-5 border-2 border-violet-200 bg-white shadow-sm space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge color="violet">{t('reviewExtractedText', lang)}</Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeFileName} · {activePageCount} pages · {activeWordCount} words
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Review or correct any typos from scanned pages before generating your interactive lesson!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      void processDocument(activeText, activeFileName, activeFileSize, activePageCount, activeWordCount);
                      setIsReviewing(false);
                    }}
                    disabled={isProcessing || !activeText.trim()}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('generateLessonFromPdf', lang)}</span>
                  </Button>
                </div>
              </div>

              <textarea
                value={activeText}
                onChange={(e) => {
                  setActiveText(e.target.value);
                  setActiveWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
                }}
                rows={7}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono leading-relaxed resize-y"
                placeholder="Extracted text from your PDF appears here..."
              />
            </Card>
          )}

          {/* 6-Stage Visual Progress Pipeline */}
          {pipelineStage !== 'idle' && (
            <Card className="p-5 border-violet-200 bg-white shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Processing Document Learning Pipeline</h4>
                    <p className="text-xs text-slate-500">Creating child-friendly interactive lesson from your PDF</p>
                  </div>
                </div>
                <Badge color="violet">
                  Step {Math.max(1, getStageIndex(pipelineStage) + 1)} of 6
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((getStageIndex(pipelineStage) + 1) / 6) * 100))}%` }}
                />
              </div>

              {/* Stage checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {PIPELINE_STAGES.map((s, idx) => {
                  const currentIdx = getStageIndex(pipelineStage);
                  const isDone = currentIdx > idx || pipelineStage === 'ready';
                  const isCurrent = currentIdx === idx && pipelineStage !== 'ready';

                  return (
                    <div
                      key={s.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : isCurrent
                          ? 'bg-violet-50 border-violet-300 text-violet-900 font-bold shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : isCurrent ? (
                          <span className="w-4 h-4 rounded-full border-2 border-violet-600 border-t-transparent animate-spin flex-shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-400">
                            {idx + 1}
                          </span>
                        )}
                        <span className={isCurrent ? 'text-violet-800 font-bold' : isDone ? 'text-emerald-800 font-semibold' : 'text-slate-600'}>
                          {s.label}
                        </span>
                      </div>
                      <p className={`text-[11px] pl-6 ${isCurrent ? 'text-violet-600' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {uploadError && (
            <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </section>

        {/* ── Active Document Workspace ──────────────────────── */}
        {(selectedDoc || isProcessing) && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-800 truncate">
                    {selectedDoc?.fileName || activeFileName || 'Document'}
                  </h2>
                  <Badge color="violet">
                    {selectedDoc?.wordCount || activeWordCount} words · {selectedDoc?.pageCount || activePageCount} pgs
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted text converted to 4th-grade learning breakdown
                </p>
              </div>

              {/* Doubt Assistant Quick Link */}
              {selectedDoc && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveText(selectedDoc.extractedText);
                      setActiveFileName(selectedDoc.fileName);
                      setActiveFileSize(selectedDoc.fileSize);
                      setActivePageCount(selectedDoc.pageCount);
                      setActiveWordCount(selectedDoc.wordCount);
                      setIsReviewing((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    <FileText className="w-4 h-4 text-violet-600" />
                    <span>{isReviewing ? 'Hide Text' : t('reviewExtractedText', lang)}</span>
                  </button>
                  <Link
                    href={`/tutor?docId=${selectedDoc.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 text-xs font-bold transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{t('pdfAskDoubtBtn', lang)}</span>
                  </Link>
                </div>
              )}
            </div>

            {/* View Mode Switcher (Video vs Notes) */}
            {selectedDoc?.generatedLesson && (
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setViewMode('video')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'video'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>🎬 Animated Video Lesson</span>
                </button>
                <button
                  onClick={() => setViewMode('notes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'notes'
                      ? 'bg-white text-violet-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>📄 Document Notes & Quiz</span>
                </button>
              </div>
            )}

            {isProcessing ? (
              <Card className="p-8 text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-600 animate-spin" />
                </div>
                <h3 className="font-bold text-slate-800">Generating student-friendly explanation...</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Creating simplified explanations, short notes, real-life examples, and practice quiz questions.
                </p>
                <ThinkingDots />
              </Card>
            ) : selectedDoc ? (
              viewMode === 'video' && selectedDoc.generatedLesson ? (
                /* ── Animated Video Lesson View ──────────────────── */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-xs">
                        🎬
                      </div>
                      <div>
                        <h3 className="font-bold text-sm md:text-base">
                          {selectedDoc.generatedLesson.title}
                        </h3>
                        <p className="text-xs text-violet-100">
                          Interactive 3-scene video lesson with AI teacher narration, 6 speeds, and checkpoints
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewMode('notes')}
                      className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all backdrop-blur-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Switch to Notes & Quiz</span>
                    </button>
                  </div>

                  <VideoLessonPlayer
                    lesson={selectedDoc.generatedLesson}
                    documentContextText={selectedDoc.extractedText}
                  />
                </div>
              ) : (
                /* ── Notes, Concepts & Quiz View ─────────────────── */
                <div className="space-y-4 animate-fade-in">
                  {/* Prompt to generate video lesson if missing */}
                  {!selectedDoc.generatedLesson && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                          🎬
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Watch this document as an Animated Video Lesson!</h4>
                          <p className="text-xs text-slate-500">Generate a 3-scene animated lesson with our virtual AI teacher</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          void processDocument(
                            selectedDoc.extractedText,
                            selectedDoc.fileName,
                            selectedDoc.fileSize,
                            selectedDoc.pageCount,
                            selectedDoc.wordCount
                          );
                        }}
                      >
                        Generate Video Lesson 🎬
                      </Button>
                    </div>
                  )}

                  {/* Navigation Tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                    {[
                      { id: 'explanation', label: t('pdfExplanationBtn', lang), icon: BookOpen },
                      { id: 'notes', label: t('pdfSummaryBtn', lang), icon: ListOrdered },
                      { id: 'concepts', label: t('keyConceptsTitle', lang), icon: Lightbulb },
                      { id: 'quiz', label: t('pdfQuizBtn', lang), icon: Sparkles },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as typeof activeTab)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Explanation Tab ──────────────────────────────── */}
                  {activeTab === 'explanation' && (
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SectionTitle>{t('pdfExplanationBtn', lang)}</SectionTitle>
                      </div>
                      {isSpeechSynthesisSupported() && (
                        <button
                          onClick={() => handleSpeak(selectedDoc.explanation || selectedDoc.extractedText)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            isSpeaking
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
                          }`}
                        >
                          {isSpeaking ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5" />
                              <span>{t('stopSpeaking', lang)}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{t('speakAnswer', lang)}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {selectedDoc.explanation || selectedDoc.extractedText}
                    </div>

                    {selectedDoc.realLifeExamples && selectedDoc.realLifeExamples.length > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>{t('realLifeExampleTitle', lang)}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-emerald-900">
                          {selectedDoc.realLifeExamples.map((ex, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span>🌱</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}

                {/* ── Short Notes Tab ──────────────────────────────── */}
                {activeTab === 'notes' && (
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <SectionTitle>{t('pdfSummaryBtn', lang)}</SectionTitle>
                      {isSpeechSynthesisSupported() && (
                        <button
                          onClick={() => handleSpeak(selectedDoc.summary || '')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('speakAnswer', lang)}</span>
                        </button>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-slate-800 leading-relaxed whitespace-pre-line text-sm">
                      {selectedDoc.summary || 'Summary not available.'}
                    </div>
                  </Card>
                )}

                {/* ── Key Concepts Tab ─────────────────────────────── */}
                {activeTab === 'concepts' && (
                  <Card className="p-6 space-y-4">
                    <SectionTitle>{t('keyConceptsTitle', lang)}</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedDoc.keyConcepts || []).map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-violet-50/70 border border-violet-100 flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-violet-200 text-violet-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {concept}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* ── Practice Quiz Tab ────────────────────────────── */}
                {activeTab === 'quiz' && selectedDoc.quiz && selectedDoc.quiz.length > 0 && (
                  <Card className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <SectionTitle>{t('pdfQuizBtn', lang)}</SectionTitle>
                      <Badge color="violet">
                        Question {currentQuestionIdx + 1} of {selectedDoc.quiz.length}
                      </Badge>
                    </div>

                    {!showQuizResults ? (
                      (() => {
                        const question = selectedDoc.quiz[currentQuestionIdx];
                        const chosen = selectedAnswers[question.id];
                        const isAnswered = chosen !== undefined;

                        return (
                          <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-base">
                              {question.question}
                            </h3>

                            <div className="space-y-2">
                              {question.options.map((opt, optIdx) => (
                                <button
                                  key={opt.id}
                                  onClick={() => handleSelectAnswer(question.id, opt.id)}
                                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${
                                    chosen === opt.id
                                      ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                                      : 'border-slate-200 bg-white hover:border-violet-300 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                                      chosen === opt.id
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="flex-1">{opt.text}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                disabled={currentQuestionIdx === 0}
                                onClick={() => setCurrentQuestionIdx((p) => p - 1)}
                              >
                                Previous
                              </Button>

                              {currentQuestionIdx < selectedDoc.quiz.length - 1 ? (
                                <Button
                                  size="sm"
                                  disabled={!isAnswered}
                                  onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                                >
                                  {t('nextQuestion', lang)}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={!isAnswered}
                                  onClick={() => setShowQuizResults(true)}
                                >
                                  {t('seeResults', lang)}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-4 text-center py-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl">
                          🎉
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                          Quiz Completed!
                        </h3>
                        <p className="text-sm text-slate-600">
                          You scored{' '}
                          <strong className="text-violet-700 font-bold">
                            {calculateQuizScore()} / {selectedDoc.quiz.length}
                          </strong>
                        </p>

                        <div className="space-y-3 text-left mt-6">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                            {t('reviewAnswers', lang)}
                          </h4>
                          {selectedDoc.quiz.map((q, idx) => {
                            const ans = selectedAnswers[q.id];
                            const isCorrect = ans === q.correctOptionId;
                            const chosenOpt = q.options.find((o) => o.id === ans);
                            const correctOpt = q.options.find((o) => o.id === q.correctOptionId);
                            return (
                              <div
                                key={q.id}
                                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                                  isCorrect
                                    ? 'bg-emerald-50/50 border-emerald-200'
                                    : 'bg-red-50/50 border-red-200'
                                }`}
                              >
                                <p className="font-bold text-slate-800">
                                  {idx + 1}. {q.question}
                                </p>
                                <p className={isCorrect ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                                  Your answer: {chosenOpt?.text || 'Not answered'} {isCorrect ? '✓' : '✗'}
                                </p>
                                {!isCorrect && correctOpt && (
                                  <p className="text-emerald-800">
                                    Correct answer: {correctOpt.text}
                                  </p>
                                )}
                                <p className="text-slate-500 italic mt-1">
                                  💡 {q.explanation}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-4 flex justify-center gap-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedAnswers({});
                              setCurrentQuestionIdx(0);
                              setShowQuizResults(false);
                            }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('tryAgain', lang)}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Extracted text collapse / view */}
                <details className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-3">
                  <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-violet-600" />
                    <span>View Extracted Plain Text ({activeWordCount} words)</span>
                  </summary>
                  <pre className="mt-3 p-3 bg-slate-50 rounded-lg whitespace-pre-wrap font-sans text-xs max-h-60 overflow-y-auto leading-relaxed border border-slate-100 text-slate-700">
                    {selectedDoc.extractedText}
                  </pre>
                </details>
              </div>
            )
          ) : null}
          </section>
        )}

        {/* ── Document Library / Previous Uploads ────────────── */}
        {documents.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <SectionTitle>Saved Documents ({documents.length})</SectionTitle>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setActiveText(doc.extractedText);
                      setActiveFileName(doc.fileName);
                      setActiveFileSize(doc.fileSize);
                      setActivePageCount(doc.pageCount);
                      setActiveWordCount(doc.wordCount);
                      setCurrentQuestionIdx(0);
                      setSelectedAnswers({});
                      setShowQuizResults(false);
                    }}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-violet-600 bg-violet-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-violet-600' : 'text-slate-400'}`} />
                        <h4 className="font-bold text-xs text-slate-800 truncate">{doc.fileName}</h4>
                      </div>
                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{doc.wordCount} words</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
