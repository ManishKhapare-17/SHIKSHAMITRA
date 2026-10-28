/**
 * Tests for progress persistence — localStorage operations
 */

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

import {
  loadProgress,
  markLessonStarted,
  markLessonCompleted,
  isLessonStarted,
  isLessonCompleted,
  saveQuizAttempt,
  getQuizAttempts,
  resetProgress,
  saveStudentName,
  getStudentName,
} from '@/lib/progress';
import type { QuizAttempt } from '@/lib/types';

function makeAttempt(overrides?: Partial<QuizAttempt>): QuizAttempt {
  return {
    id: `attempt-${Date.now()}-${Math.random()}`,
    quizId: 'quiz-math-fractions-g4',
    lessonId: 'math-fractions-g4',
    subjectId: 'mathematics',
    difficulty: 'easy',
    score: 2,
    totalQuestions: 3,
    answers: { 'q1': 'b' },
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorageMock.clear();
});

// ── loadProgress ──────────────────────────────────────────────

describe('loadProgress', () => {
  it('returns default progress when storage is empty', () => {
    const p = loadProgress();
    expect(p.lessonProgress).toEqual([]);
    expect(p.quizAttempts).toEqual([]);
    expect(p.streakDays).toBe(0);
    expect(p.studentName).toBe('Student');
  });

  it('returns default progress when storage contains invalid JSON', () => {
    localStorageMock.setItem('shikshamitra_progress_v2', 'NOT_VALID_JSON{{{');
    const p = loadProgress();
    expect(p.lessonProgress).toEqual([]);
  });

  it('returns default progress when stored object is malformed', () => {
    localStorageMock.setItem('shikshamitra_progress_v2', JSON.stringify({ invalid: true }));
    const p = loadProgress();
    expect(p.lessonProgress).toEqual([]);
  });

  it('loads valid stored progress correctly', () => {
    const stored = {
      schemaVersion: 2,
      studentName: 'Priya',
      gradeLevel: 4,
      lessonProgress: [],
      quizAttempts: [],
      streakDays: 5,
      lastActiveDate: '2026-01-01',
      createdAt: new Date().toISOString(),
    };
    localStorageMock.setItem('shikshamitra_progress_v2', JSON.stringify(stored));
    const p = loadProgress();
    expect(p.studentName).toBe('Priya');
    expect(p.streakDays).toBe(5);
  });
});

// ── Lesson progress ───────────────────────────────────────────

describe('markLessonStarted', () => {
  it('adds a new lesson to progress', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    expect(isLessonStarted('math-fractions-g4')).toBe(true);
  });

  it('does not add duplicate lesson entries', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    const p = loadProgress();
    const entries = p.lessonProgress.filter((lp) => lp.lessonId === 'math-fractions-g4');
    expect(entries).toHaveLength(1);
  });
});

describe('markLessonCompleted', () => {
  it('marks a started lesson as completed', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    const result = markLessonCompleted('math-fractions-g4');
    expect(result).toBe(true);
    expect(isLessonCompleted('math-fractions-g4')).toBe(true);
  });

  it('returns false if lesson was never started', () => {
    const result = markLessonCompleted('nonexistent-lesson');
    expect(result).toBe(false);
  });

  it('prevents duplicate completion (idempotent)', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    markLessonCompleted('math-fractions-g4');
    const result2 = markLessonCompleted('math-fractions-g4');
    expect(result2).toBe(false);
    // Still completed, not duplicated
    const p = loadProgress();
    const completed = p.lessonProgress.filter(
      (lp) => lp.lessonId === 'math-fractions-g4' && !!lp.completedAt
    );
    expect(completed).toHaveLength(1);
  });

  it('preserves completedAt timestamp on second call', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    markLessonCompleted('math-fractions-g4');
    const p1 = loadProgress();
    const ts1 = p1.lessonProgress[0].completedAt;

    // Second call should be no-op
    markLessonCompleted('math-fractions-g4');
    const p2 = loadProgress();
    const ts2 = p2.lessonProgress[0].completedAt;
    expect(ts1).toBe(ts2);
  });
});

// ── Quiz attempts ─────────────────────────────────────────────

describe('saveQuizAttempt / getQuizAttempts', () => {
  it('saves and retrieves quiz attempts', () => {
    const attempt = makeAttempt();
    saveQuizAttempt(attempt);
    const attempts = getQuizAttempts();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].id).toBe(attempt.id);
  });

  it('retrieves attempts filtered by quizId', () => {
    saveQuizAttempt(makeAttempt({ quizId: 'quiz-a', id: 'id-1' }));
    saveQuizAttempt(makeAttempt({ quizId: 'quiz-b', id: 'id-2' }));
    const aAttempts = getQuizAttempts('quiz-a');
    expect(aAttempts).toHaveLength(1);
    expect(aAttempts[0].quizId).toBe('quiz-a');
  });

  it('allows multiple attempts for the same quiz', () => {
    saveQuizAttempt(makeAttempt({ id: 'attempt-1' }));
    saveQuizAttempt(makeAttempt({ id: 'attempt-2' }));
    saveQuizAttempt(makeAttempt({ id: 'attempt-3' }));
    expect(getQuizAttempts()).toHaveLength(3);
  });
});

// ── Student name ──────────────────────────────────────────────

describe('saveStudentName / getStudentName', () => {
  it('saves and returns student name', () => {
    saveStudentName('Aanya');
    expect(getStudentName()).toBe('Aanya');
  });

  it('trims whitespace from student name', () => {
    saveStudentName('  Rohan  ');
    expect(getStudentName()).toBe('Rohan');
  });

  it('uses "Student" as fallback for empty name', () => {
    saveStudentName('   ');
    expect(getStudentName()).toBe('Student');
  });

  it('truncates name to 40 characters', () => {
    saveStudentName('A'.repeat(100));
    expect(getStudentName().length).toBeLessThanOrEqual(40);
  });
});

// ── resetProgress ─────────────────────────────────────────────

describe('resetProgress', () => {
  it('clears all stored progress', () => {
    markLessonStarted('math-fractions-g4', 'mathematics', 4);
    saveQuizAttempt(makeAttempt());
    resetProgress();
    const p = loadProgress();
    expect(p.lessonProgress).toEqual([]);
    expect(p.quizAttempts).toEqual([]);
  });
});
