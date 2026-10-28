// ============================================================
// ShikshaMitra AI — Quiz Engine (scoring & evaluation)
// ============================================================

import type { Quiz, QuizQuestion, Difficulty, QuizAttempt } from './types';
import { saveQuizAttempt } from './progress';

export interface QuizSession {
  quizId: string;
  lessonId: string;
  subjectId: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  answers: Record<string, string>;   // questionId → chosen optionId
  currentIndex: number;
  submitted: boolean;
}

// ──── Build a quiz session ────────────────────────────────────

export function buildQuizSession(quiz: Quiz, difficulty: Difficulty): QuizSession {
  return {
    quizId: quiz.id,
    lessonId: quiz.lessonId,
    subjectId: quiz.subjectId,
    difficulty,
    questions: quiz.questions[difficulty],
    answers: {},
    currentIndex: 0,
    submitted: false,
  };
}

// ──── Score a completed session ──────────────────────────────

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  answers: Record<string, string>;
  questions: QuizQuestion[];
}

export function scoreQuizSession(session: QuizSession): QuizResult {
  const { questions, answers } = session;
  const score = questions.reduce((count, q) => {
    return count + (answers[q.id] === q.correctOptionId ? 1 : 0);
  }, 0);
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  return {
    score,
    totalQuestions,
    percentage,
    passed: percentage >= 60,
    answers,
    questions,
  };
}

// ──── Persist a completed attempt ────────────────────────────

export function persistQuizAttempt(session: QuizSession, result: QuizResult): QuizAttempt {
  const attempt: QuizAttempt = {
    id: `${session.quizId}-${Date.now()}`,
    quizId: session.quizId,
    lessonId: session.lessonId,
    subjectId: session.subjectId as QuizAttempt['subjectId'],
    difficulty: session.difficulty,
    score: result.score,
    totalQuestions: result.totalQuestions,
    answers: result.answers,
    completedAt: new Date().toISOString(),
  };
  saveQuizAttempt(attempt);
  return attempt;
}

// ──── Check if an answer is correct ─────────────────────────

export function isCorrect(question: QuizQuestion, chosenOptionId: string): boolean {
  return question.correctOptionId === chosenOptionId;
}

// ──── Get grade label ─────────────────────────────────────────

export function getScoreLabel(percentage: number): { label: string; color: string; emoji: string } {
  if (percentage >= 90) return { label: 'Excellent!', color: 'text-green-600', emoji: '🌟' };
  if (percentage >= 70) return { label: 'Good Job!', color: 'text-blue-600', emoji: '👍' };
  if (percentage >= 50) return { label: 'Keep Trying!', color: 'text-yellow-600', emoji: '💪' };
  return { label: 'Needs Practice', color: 'text-red-600', emoji: '📚' };
}
