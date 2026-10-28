// ============================================================
// ShikshaMitra AI — Quiz Engine (scoring & evaluation)
// ============================================================

import type { Quiz, QuizQuestion, Difficulty, QuizAttempt, Language, AnswerOption } from './types';
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
    questions: quiz.questions[difficulty] || [],
    answers: {},
    currentIndex: 0,
    submitted: false,
  };
}

// ──── Build custom quiz (e.g. from uploaded PDF) ─────────────

export function buildCustomQuiz(
  docId: string,
  docTitle: string,
  questions: QuizQuestion[],
  difficulty: Difficulty = 'easy'
): Quiz {
  return {
    id: `quiz-doc-${docId}`,
    lessonId: docId,
    subjectId: 'science',
    title: `${docTitle} Practice Quiz`,
    questions: {
      easy: difficulty === 'easy' ? questions : [],
      medium: difficulty === 'medium' ? questions : [],
      hard: difficulty === 'hard' ? questions : [],
    },
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
    subjectId: (session.subjectId || 'mathematics') as QuizAttempt['subjectId'],
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

// ──── Multilingual resolution helpers ────────────────────────

export function getQuestionText(q: QuizQuestion, lang: Language): string {
  if (lang !== 'en' && q.questionTranslations?.[lang]) {
    return q.questionTranslations[lang];
  }
  return q.question;
}

export function getOptionText(opt: AnswerOption, lang: Language): string {
  if (lang !== 'en' && opt.textTranslations?.[lang]) {
    return opt.textTranslations[lang];
  }
  return opt.text;
}

export function getExplanationText(q: QuizQuestion, chosenWasCorrect: boolean, lang: Language): string {
  if (chosenWasCorrect) {
    if (lang !== 'en' && q.explanationTranslations?.[lang]) {
      return q.explanationTranslations[lang];
    }
    return q.explanation;
  }
  if (lang !== 'en' && q.incorrectExplanationTranslations?.[lang]) {
    return q.incorrectExplanationTranslations[lang];
  }
  return q.incorrectExplanation;
}

// ──── Get grade label ─────────────────────────────────────────

export function getScoreLabel(percentage: number, lang: Language = 'en'): { label: string; color: string; emoji: string } {
  if (percentage >= 90) {
    const labels = { en: 'Excellent!', hi: 'शानदार!', mr: 'उत्कृष्ट!' };
    return { label: labels[lang] || labels.en, color: 'text-green-600', emoji: '🌟' };
  }
  if (percentage >= 70) {
    const labels = { en: 'Good Job!', hi: 'बहुत बढ़िया!', mr: 'छान केले!' };
    return { label: labels[lang] || labels.en, color: 'text-blue-600', emoji: '👍' };
  }
  if (percentage >= 50) {
    const labels = { en: 'Keep Trying!', hi: 'कोशिश जारी रखें!', mr: 'प्रयत्न चालू ठेवा!' };
    return { label: labels[lang] || labels.en, color: 'text-yellow-600', emoji: '💪' };
  }
  const labels = { en: 'Needs Practice', hi: 'और अभ्यास करें', mr: 'अधिक सरावाची गरज' };
  return { label: labels[lang] || labels.en, color: 'text-red-600', emoji: '📚' };
}
