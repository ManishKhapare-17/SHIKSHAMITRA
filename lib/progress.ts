// ============================================================
// ShikshaMitra AI — Progress Storage (localStorage)
// ============================================================

import type {
  PersistedProgress,
  LessonProgress,
  LessonCheckpoint,
  QuizAttempt,
  StudentActivity,
  TopicPerformance,
  Recommendation,
  Language,
  TeacherPersona,
  DocumentLearningData,
} from './types';
import { STORAGE_SCHEMA_VERSION } from './types';
import { LESSON_MAP, LESSONS } from './lessons';

const STORAGE_KEY = 'shikshamitra_progress_v3';
const LEGACY_KEYS = ['shikshamitra_progress_v2', 'shikshamitra_progress_v1'];
const TODAY = (): string => new Date().toISOString().slice(0, 10);

// ──── Safe localStorage access ───────────────────────────────

function storageAvailable(): boolean {
  try {
    const test = '__sm_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function loadRaw(): unknown {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Try migration from legacy keys
    for (const legacyKey of LEGACY_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        return JSON.parse(legacyRaw);
      }
    }
    return null;
  } catch {
    return null;
  }
}

function isValidProgress(data: unknown): data is PersistedProgress {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.schemaVersion === 'number' &&
    Array.isArray(d.lessonProgress) &&
    Array.isArray(d.quizAttempts)
  );
}

// ──── Load / Save ─────────────────────────────────────────────

export function loadProgress(): PersistedProgress {
  const raw = loadRaw();
  if (isValidProgress(raw) && raw.schemaVersion >= 1) {
    // Migrate older schemas forward
    return {
      ...defaultProgress(),
      ...raw,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      preferredLanguage: (raw.preferredLanguage as Language) || 'en',
      teacherPersona: (raw.teacherPersona as TeacherPersona) || 'female',
      speechRate: typeof raw.speechRate === 'number' ? raw.speechRate : 1,
      documents: Array.isArray(raw.documents) ? raw.documents : [],
      checkpoints: raw.checkpoints && typeof raw.checkpoints === 'object' ? raw.checkpoints : {},
    };
  }
  return defaultProgress();
}

function defaultProgress(): PersistedProgress {
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    studentName: 'Student',
    gradeLevel: 4,
    preferredLanguage: 'en',
    teacherPersona: 'female',
    speechRate: 1,
    lessonProgress: [],
    quizAttempts: [],
    documents: [],
    checkpoints: {},
    streakDays: 0,
    lastActiveDate: '',
    createdAt: new Date().toISOString(),
  };
}

function saveProgress(progress: PersistedProgress): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage quota exceeded or unavailable — silently handle
  }
}

// ──── Update streak ──────────────────────────────────────────

function updateStreak(progress: PersistedProgress): PersistedProgress {
  const today = TODAY();
  const last = progress.lastActiveDate;
  if (last === today) return progress;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const newStreak = last === yStr ? progress.streakDays + 1 : 1;
  return { ...progress, streakDays: newStreak, lastActiveDate: today };
}

// ──── Preferences: Language, Teacher, Voice ──────────────────

export function getPreferredLanguage(): Language {
  return loadProgress().preferredLanguage || 'en';
}

export function savePreferredLanguage(lang: Language): void {
  const progress = loadProgress();
  saveProgress({ ...progress, preferredLanguage: lang });
}

export function getTeacherPersona(): TeacherPersona {
  return loadProgress().teacherPersona || 'female';
}

export function saveTeacherPersona(persona: TeacherPersona): void {
  const progress = loadProgress();
  saveProgress({ ...progress, teacherPersona: persona });
}

export function getSpeechRate(): number {
  return loadProgress().speechRate || 1;
}

export function saveSpeechRate(rate: number): void {
  const progress = loadProgress();
  saveProgress({ ...progress, speechRate: Math.max(0.5, Math.min(2.0, rate)) });
}

// ──── Lesson Progress ────────────────────────────────────────

export function markLessonStarted(lessonId: string, subjectId: string, grade: number): void {
  const progress = loadProgress();
  const exists = progress.lessonProgress.some((lp) => lp.lessonId === lessonId);
  const updatedList = exists
    ? progress.lessonProgress.map((lp) =>
        lp.lessonId === lessonId ? { ...lp, lastStudiedAt: new Date().toISOString() } : lp
      )
    : [
        ...progress.lessonProgress,
        {
          lessonId,
          subjectId: subjectId as LessonProgress['subjectId'],
          grade,
          startedAt: new Date().toISOString(),
          lastStudiedAt: new Date().toISOString(),
        },
      ];

  const updated: PersistedProgress = {
    ...updateStreak(progress),
    lessonProgress: updatedList,
  };
  saveProgress(updated);
}

export function markLessonCompleted(lessonId: string): boolean {
  const progress = loadProgress();
  const idx = progress.lessonProgress.findIndex((lp) => lp.lessonId === lessonId);
  if (idx === -1) return false;
  // Prevent double-completion
  if (progress.lessonProgress[idx].completedAt) return false;
  const updatedLessons = [...progress.lessonProgress];
  updatedLessons[idx] = {
    ...updatedLessons[idx],
    completedAt: new Date().toISOString(),
    lastStudiedAt: new Date().toISOString(),
  };
  saveProgress({ ...updateStreak(progress), lessonProgress: updatedLessons });
  return true;
}

export function isLessonStarted(lessonId: string): boolean {
  return loadProgress().lessonProgress.some((lp) => lp.lessonId === lessonId);
}

export function isLessonCompleted(lessonId: string): boolean {
  return loadProgress().lessonProgress.some(
    (lp) => lp.lessonId === lessonId && !!lp.completedAt
  );
}

// ──── Lesson Checkpoints ─────────────────────────────────────

export function saveLessonCheckpoint(checkpoint: LessonCheckpoint): void {
  const progress = loadProgress();
  const checkpoints = { ...(progress.checkpoints || {}) };
  checkpoints[checkpoint.lessonId] = {
    ...checkpoint,
    lastUpdatedAt: new Date().toISOString(),
  };

  const updatedLessons = progress.lessonProgress.map((lp) =>
    lp.lessonId === checkpoint.lessonId
      ? { ...lp, checkpoint, lastStudiedAt: new Date().toISOString() }
      : lp
  );

  saveProgress({
    ...updateStreak(progress),
    checkpoints,
    lessonProgress: updatedLessons,
  });
}

export function getLessonCheckpoint(lessonId: string): LessonCheckpoint | undefined {
  const progress = loadProgress();
  if (progress.checkpoints?.[lessonId]) {
    return progress.checkpoints[lessonId];
  }
  const lessonProg = progress.lessonProgress.find((lp) => lp.lessonId === lessonId);
  return lessonProg?.checkpoint;
}

export function clearLessonCheckpoint(lessonId: string): void {
  const progress = loadProgress();
  if (!progress.checkpoints?.[lessonId]) return;
  const checkpoints = { ...progress.checkpoints };
  delete checkpoints[lessonId];
  saveProgress({ ...progress, checkpoints });
}

// ──── Quiz Attempts ──────────────────────────────────────────

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const progress = loadProgress();
  const updated: PersistedProgress = {
    ...updateStreak(progress),
    quizAttempts: [...progress.quizAttempts, attempt],
  };
  saveProgress(updated);
}

export function getQuizAttempts(quizId?: string): QuizAttempt[] {
  const progress = loadProgress();
  if (!quizId) return progress.quizAttempts;
  return progress.quizAttempts.filter((a) => a.quizId === quizId);
}

// ──── PDF / Documents ────────────────────────────────────────

export function saveDocumentLearning(doc: DocumentLearningData): void {
  const progress = loadProgress();
  const existingIdx = progress.documents.findIndex((d) => d.id === doc.id);
  const updatedDocs = [...progress.documents];
  if (existingIdx >= 0) {
    updatedDocs[existingIdx] = doc;
  } else {
    updatedDocs.unshift(doc);
  }
  saveProgress({
    ...updateStreak(progress),
    documents: updatedDocs.slice(0, 10), // keep last 10 documents
  });
}

export function getDocuments(): DocumentLearningData[] {
  return loadProgress().documents || [];
}

export function getDocumentById(id: string): DocumentLearningData | undefined {
  return (loadProgress().documents || []).find((d) => d.id === id);
}

export function deleteDocument(id: string): void {
  const progress = loadProgress();
  saveProgress({
    ...progress,
    documents: (progress.documents || []).filter((d) => d.id !== id),
  });
}

// ──── Student Name ───────────────────────────────────────────

export function saveStudentName(name: string): void {
  const progress = loadProgress();
  saveProgress({ ...progress, studentName: name.slice(0, 40).trim() || 'Student' });
}

export function getStudentName(): string {
  return loadProgress().studentName;
}

// ──── Activity Summary ───────────────────────────────────────

export function getActivityLast7Days(): StudentActivity[] {
  const progress = loadProgress();
  const days: StudentActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    const lessonsStarted = progress.lessonProgress.filter(
      (lp) => (lp.startedAt || '').slice(0, 10) === dateStr
    ).length;
    const lessonsCompleted = progress.lessonProgress.filter(
      (lp) => (lp.completedAt || '').slice(0, 10) === dateStr
    ).length;
    const attempts = progress.quizAttempts.filter(
      (qa) => (qa.completedAt || '').slice(0, 10) === dateStr
    );
    const quizAttempts = attempts.length;
    const correctAnswers = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalAnswers = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);

    days.push({ date: dateStr, lessonsStarted, lessonsCompleted, quizAttempts, correctAnswers, totalAnswers });
  }
  return days;
}

// ──── Topic Performance ──────────────────────────────────────

export function getTopicPerformance(): TopicPerformance[] {
  const progress = loadProgress();
  const byLesson: Record<string, QuizAttempt[]> = {};
  for (const attempt of progress.quizAttempts) {
    if (!byLesson[attempt.lessonId]) byLesson[attempt.lessonId] = [];
    byLesson[attempt.lessonId].push(attempt);
  }
  return Object.entries(byLesson).map(([lessonId, attempts]) => {
    const lesson = LESSON_MAP[lessonId];
    const scores = attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100));
    const best = Math.max(...scores);
    const latest = scores[scores.length - 1];
    return {
      lessonId,
      lessonTitle: lesson?.title ?? lessonId,
      subjectId: lesson?.subjectId ?? 'mathematics',
      attempts: attempts.length,
      bestScore: best,
      latestScore: latest,
      needsPractice: best < 70,
    };
  });
}

// ──── Recommendations ────────────────────────────────────────

export function getRecommendations(): Recommendation[] {
  const performance = getTopicPerformance();
  const progress = loadProgress();
  const completedIds = new Set(
    progress.lessonProgress.filter((lp) => !!lp.completedAt).map((lp) => lp.lessonId)
  );

  const recommendations: Recommendation[] = [];

  // 1. Topics with poor quiz performance → retry quiz
  for (const p of performance) {
    if (p.needsPractice) {
      recommendations.push({
        type: 'retry_quiz',
        lessonId: p.lessonId,
        lessonTitle: p.lessonTitle,
        subjectId: p.subjectId,
        reason: `Your best score was ${p.bestScore}% — a bit more practice will help!`,
        priority: 1,
      });
    }
  }

  // 2. Lessons started but not completed → review lesson
  const startedNotCompleted = progress.lessonProgress.filter(
    (lp) => !lp.completedAt
  );
  for (const lp of startedNotCompleted) {
    const lesson = LESSON_MAP[lp.lessonId];
    if (!lesson) continue;
    recommendations.push({
      type: 'review_lesson',
      lessonId: lp.lessonId,
      lessonTitle: lesson.title,
      subjectId: lesson.subjectId,
      reason: 'You started this lesson — finish it to complete your learning!',
      priority: 2,
    });
  }

  // 3. Lessons not yet started → next lesson
  for (const lesson of LESSONS) {
    if (!completedIds.has(lesson.id) && !startedNotCompleted.find((lp) => lp.lessonId === lesson.id)) {
      recommendations.push({
        type: 'next_lesson',
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        subjectId: lesson.subjectId,
        reason: "You haven't tried this lesson yet — give it a go!",
        priority: 3,
      });
    }
  }

  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);
}

// ──── Reset ──────────────────────────────────────────────────

export function resetProgress(): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    for (const legacyKey of LEGACY_KEYS) {
      localStorage.removeItem(legacyKey);
    }
  } catch {
    // ignore
  }
}

export function isStorageAvailable(): boolean {
  return storageAvailable();
}
