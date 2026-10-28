/**
 * Tests for the quiz engine — scoring, evaluation, session management
 */

import {
  buildQuizSession,
  scoreQuizSession,
  isCorrect,
  getScoreLabel,
  getQuestionText,
  getOptionText,
  getExplanationText,
  buildCustomQuiz,
} from '@/lib/quiz-engine';
import { QUIZZES } from '@/lib/quizzes';
import type { Quiz, Difficulty } from '@/lib/types';

const mathQuiz = QUIZZES.find((q) => q.id === 'quiz-math-fractions-g4') as Quiz;
const sciQuiz = QUIZZES.find((q) => q.id === 'quiz-sci-water-cycle-g4') as Quiz;

// ── buildQuizSession ──────────────────────────────────────────

describe('buildQuizSession', () => {
  it('creates a session with the correct difficulty questions', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    expect(session.difficulty).toBe('easy');
    expect(session.questions).toHaveLength(mathQuiz.questions.easy.length);
    expect(session.questions).toEqual(mathQuiz.questions.easy);
  });

  it('starts at index 0 with empty answers', () => {
    const session = buildQuizSession(mathQuiz, 'medium');
    expect(session.currentIndex).toBe(0);
    expect(session.answers).toEqual({});
    expect(session.submitted).toBe(false);
  });

  it('sets correct quizId and lessonId', () => {
    const session = buildQuizSession(mathQuiz, 'hard');
    expect(session.quizId).toBe(mathQuiz.id);
    expect(session.lessonId).toBe(mathQuiz.lessonId);
  });

  it('works for all three difficulties', () => {
    const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    for (const d of difficulties) {
      const s = buildQuizSession(sciQuiz, d);
      expect(s.questions.length).toBeGreaterThan(0);
      expect(s.difficulty).toBe(d);
    }
  });
});

// ── scoreQuizSession ──────────────────────────────────────────

describe('scoreQuizSession', () => {
  it('scores all correct answers as 100%', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    // Answer all correctly
    const answers: Record<string, string> = {};
    for (const q of session.questions) {
      answers[q.id] = q.correctOptionId;
    }
    const scored = { ...session, answers };
    const result = scoreQuizSession(scored);
    expect(result.score).toBe(session.questions.length);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('scores all wrong answers as 0%', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    const answers: Record<string, string> = {};
    for (const q of session.questions) {
      // Pick any wrong option
      const wrong = q.options.find((o) => o.id !== q.correctOptionId);
      answers[q.id] = wrong!.id;
    }
    const scored = { ...session, answers };
    const result = scoreQuizSession(scored);
    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('calculates partial score correctly', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    const questions = session.questions;
    const answers: Record<string, string> = {};
    // Get first question right, rest wrong
    answers[questions[0].id] = questions[0].correctOptionId;
    for (let i = 1; i < questions.length; i++) {
      const wrong = questions[i].options.find((o) => o.id !== questions[i].correctOptionId);
      answers[questions[i].id] = wrong!.id;
    }
    const result = scoreQuizSession({ ...session, answers });
    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(questions.length);
    expect(result.percentage).toBe(Math.round((1 / questions.length) * 100));
  });

  it('handles empty answers gracefully', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    const result = scoreQuizSession({ ...session, answers: {} });
    expect(result.score).toBe(0);
    expect(result.percentage).toBe(0);
  });

  it('marks as passed when score >= 60%', () => {
    const session = buildQuizSession(mathQuiz, 'easy');
    const questions = session.questions;
    const answers: Record<string, string> = {};
    // Answer all correctly
    for (const q of questions) answers[q.id] = q.correctOptionId;
    const result = scoreQuizSession({ ...session, answers });
    expect(result.passed).toBe(true);
  });
});

// ── isCorrect ─────────────────────────────────────────────────

describe('isCorrect', () => {
  const q = mathQuiz.questions.easy[0];

  it('returns true for correct option', () => {
    expect(isCorrect(q, q.correctOptionId)).toBe(true);
  });

  it('returns false for wrong option', () => {
    const wrong = q.options.find((o) => o.id !== q.correctOptionId)!;
    expect(isCorrect(q, wrong.id)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isCorrect(q, '')).toBe(false);
  });
});

// ── getScoreLabel ─────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns Excellent for 90+', () => {
    expect(getScoreLabel(90).label).toBe('Excellent!');
    expect(getScoreLabel(100).label).toBe('Excellent!');
  });

  it('returns Good Job for 70–89', () => {
    expect(getScoreLabel(70).label).toBe('Good Job!');
    expect(getScoreLabel(89).label).toBe('Good Job!');
  });

  it('returns Keep Trying for 50–69', () => {
    expect(getScoreLabel(50).label).toBe('Keep Trying!');
    expect(getScoreLabel(69).label).toBe('Keep Trying!');
  });

  it('returns Needs Practice for below 50', () => {
    expect(getScoreLabel(0).label).toBe('Needs Practice');
    expect(getScoreLabel(49).label).toBe('Needs Practice');
  });

  it('returns different colors for different scores', () => {
    expect(getScoreLabel(100).color).not.toBe(getScoreLabel(0).color);
  });

  it('provides multilingual score labels for Hindi and Marathi', () => {
    expect(getScoreLabel(100, 'hi').label).toBe('शानदार!');
    expect(getScoreLabel(100, 'mr').label).toBe('उत्कृष्ट!');
    expect(getScoreLabel(80, 'hi').label).toBe('बहुत बढ़िया!');
    expect(getScoreLabel(60, 'mr').label).toBe('प्रयत्न चालू ठेवा!');
  });
});

// ── Trilingual Question & Option Helpers ──────────────────────

describe('Trilingual Question Helpers', () => {
  it('retrieves Hindi and Marathi question text when available', () => {
    const q = mathQuiz.questions.easy[0];
    const enText = getQuestionText(q, 'en');
    const hiText = getQuestionText(q, 'hi');
    const mrText = getQuestionText(q, 'mr');

    expect(enText).toBe(q.question);
    expect(hiText).toBeTruthy();
    expect(mrText).toBeTruthy();
    expect(hiText).not.toBe(enText);
  });

  it('retrieves Hindi and Marathi option text', () => {
    const opt = mathQuiz.questions.easy[0].options[0];
    const enOpt = getOptionText(opt, 'en');
    const hiOpt = getOptionText(opt, 'hi');
    const mrOpt = getOptionText(opt, 'mr');

    expect(enOpt).toBe(opt.text);
    expect(hiOpt).toBeTruthy();
    expect(mrOpt).toBeTruthy();

    const q = mathQuiz.questions.easy[0];
    expect(getExplanationText(q, true, 'hi')).toBeTruthy();
  });

  it('builds a custom quiz from ad-hoc question list', () => {
    const custom = buildCustomQuiz('custom-1', 'My Document Quiz', [mathQuiz.questions.easy[0]]);
    expect(custom.id).toBe('quiz-doc-custom-1');
    expect(custom.questions.easy).toHaveLength(1);
  });
});

// ── Quiz data integrity ───────────────────────────────────────

describe('Quiz data integrity', () => {
  it('all quizzes have questions for all difficulties', () => {
    for (const quiz of QUIZZES) {
      expect(quiz.questions.easy.length).toBeGreaterThan(0);
      expect(quiz.questions.medium.length).toBeGreaterThan(0);
      expect(quiz.questions.hard.length).toBeGreaterThan(0);
    }
  });

  it('all questions have a valid correct option', () => {
    for (const quiz of QUIZZES) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        for (const q of quiz.questions[level]) {
          const optionIds = q.options.map((o) => o.id);
          expect(optionIds).toContain(q.correctOptionId);
        }
      }
    }
  });

  it('all questions have exactly 4 options', () => {
    for (const quiz of QUIZZES) {
      for (const level of ['easy', 'medium', 'hard'] as const) {
        for (const q of quiz.questions[level]) {
          expect(q.options).toHaveLength(4);
        }
      }
    }
  });

  it('question IDs are unique within each quiz', () => {
    for (const quiz of QUIZZES) {
      const ids: string[] = [];
      for (const level of ['easy', 'medium', 'hard'] as const) {
        for (const q of quiz.questions[level]) {
          expect(ids).not.toContain(q.id);
          ids.push(q.id);
        }
      }
    }
  });
});
