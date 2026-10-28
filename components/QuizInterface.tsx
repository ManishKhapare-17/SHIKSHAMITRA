'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Check, X, ChevronRight, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';
import { Button, Badge, Card, ProgressBar } from '@/components/ui';
import {
  buildQuizSession,
  scoreQuizSession,
  persistQuizAttempt,
  isCorrect,
  getScoreLabel,
  type QuizSession,
  type QuizResult,
} from '@/lib/quiz-engine';
import type { Quiz, Difficulty, AnswerOption } from '@/lib/types';
import { SUBJECT_MAP } from '@/lib/subjects';

interface Props {
  quiz: Quiz;
  lessonTitle: string;
}

type UIPhase = 'select-difficulty' | 'question' | 'results' | 'review';

export default function QuizInterface({ quiz, lessonTitle }: Props) {
  const subject = SUBJECT_MAP[quiz.subjectId];
  const [phase, setPhase] = useState<UIPhase>('select-difficulty');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  // Prevent double-submission
  const submittedRef = useRef(false);

  const startQuiz = useCallback((difficulty: Difficulty) => {
    submittedRef.current = false;
    const s = buildQuizSession(quiz, difficulty);
    setSession(s);
    setLocalAnswers({});
    setAnswerSubmitted(false);
    setPhase('question');
  }, [quiz]);

  const selectAnswer = useCallback((optionId: string) => {
    if (!session || answerSubmitted) return;
    const qId = session.questions[session.currentIndex].id;
    setLocalAnswers((prev) => ({ ...prev, [qId]: optionId }));
  }, [session, answerSubmitted]);

  const submitAnswer = useCallback(() => {
    if (!session || answerSubmitted) return;
    const qId = session.questions[session.currentIndex].id;
    if (!localAnswers[qId]) return;
    setAnswerSubmitted(true);
    // Merge into session
    setSession((prev: QuizSession | null) => prev
      ? { ...prev, answers: { ...prev.answers, [qId]: localAnswers[qId] } }
      : prev
    );
  }, [session, answerSubmitted, localAnswers]);

  const nextQuestion = useCallback(() => {
    if (!session) return;
    const updatedSession: QuizSession = {
      ...session,
      answers: { ...session.answers, ...localAnswers },
      currentIndex: session.currentIndex + 1,
    };
    if (updatedSession.currentIndex >= updatedSession.questions.length) {
      // Final — score
      if (!submittedRef.current) {
        submittedRef.current = true;
        const finalResult = scoreQuizSession(updatedSession);
        persistQuizAttempt(updatedSession, finalResult);
        setResult(finalResult);
        setSession(updatedSession);
        setPhase('results');
      }
    } else {
      setSession(updatedSession);
      setAnswerSubmitted(false);
      setPhase('question');
    }
  }, [session, localAnswers]);

  const resetQuiz = useCallback(() => {
    submittedRef.current = false;
    setSession(null);
    setResult(null);
    setLocalAnswers({});
    setAnswerSubmitted(false);
    setPhase('select-difficulty');
  }, []);

  // ── DIFFICULTY SELECTION ─────────────────────────────────
  if (phase === 'select-difficulty') {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <Link href={`/lessons/${quiz.lessonId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Lesson
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color={quiz.subjectId === 'mathematics' ? 'blue' : quiz.subjectId === 'science' ? 'green' : 'violet'}>
              {subject.emoji} {subject.name}
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{quiz.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{lessonTitle}</p>
        </div>

        <Card className="p-6">
          <h2 className="font-bold text-slate-800 mb-4">Choose Difficulty</h2>
          <div className="space-y-3">
            {(
              [
                { d: 'easy' as Difficulty, emoji: '🌱', label: 'Easy', desc: '3 questions · Basic understanding', color: 'border-green-200 hover:border-green-400 hover:bg-green-50' },
                { d: 'medium' as Difficulty, emoji: '⚡', label: 'Medium', desc: '3 questions · Apply what you learned', color: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50' },
                { d: 'hard' as Difficulty, emoji: '🔥', label: 'Hard', desc: '3 questions · Challenge yourself', color: 'border-red-200 hover:border-red-400 hover:bg-red-50' },
              ] as const
            ).map(({ d, emoji, label, desc, color }) => (
              <button
                key={d}
                onClick={() => startQuiz(d)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${color} group`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-700" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ── QUESTION PHASE ───────────────────────────────────────
  if (phase === 'question' && session) {
    const currentQ = session.questions[session.currentIndex];
    const selectedOption = localAnswers[currentQ.id];
    const totalQ = session.questions.length;
    const progress = ((session.currentIndex) / totalQ) * 100;

    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge color={session.difficulty === 'easy' ? 'green' : session.difficulty === 'medium' ? 'amber' : 'red'}>
            {session.difficulty === 'easy' ? '🌱 Easy' : session.difficulty === 'medium' ? '⚡ Medium' : '🔥 Hard'}
          </Badge>
          <span className="text-sm text-slate-500 font-medium">
            Question {session.currentIndex + 1} / {totalQ}
          </span>
        </div>
        <ProgressBar value={progress} />

        {/* Question */}
        <Card className="p-6">
          <p className="text-slate-800 font-bold text-base leading-relaxed mb-5">
            {currentQ.question}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt: AnswerOption) => {
              const isSelected = selectedOption === opt.id;
              const correctOpt = currentQ.correctOptionId;
              let cls = 'w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ';
              if (!answerSubmitted) {
                cls += isSelected
                  ? 'border-violet-500 bg-violet-50 text-violet-800'
                  : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50 text-slate-700';
              } else {
                if (opt.id === correctOpt) cls += 'border-green-500 bg-green-50 text-green-800';
                else if (isSelected) cls += 'border-red-400 bg-red-50 text-red-700';
                else cls += 'border-slate-100 text-slate-400';
              }
              return (
                <button
                  key={opt.id}
                  className={cls}
                  disabled={answerSubmitted}
                  onClick={() => selectAnswer(opt.id)}
                  aria-pressed={isSelected}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                      {answerSubmitted && opt.id === correctOpt ? <Check className="w-3.5 h-3.5" />
                        : answerSubmitted && isSelected && opt.id !== correctOpt ? <X className="w-3.5 h-3.5" />
                        : opt.id.toUpperCase()}
                    </span>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation after submit */}
          {answerSubmitted && (
            <div className={`mt-4 p-4 rounded-xl border ${isCorrect(currentQ, selectedOption ?? '') ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className="text-sm font-bold mb-1">
                {isCorrect(currentQ, selectedOption ?? '') ? '✅ Correct!' : '📚 Not quite!'}
              </p>
              <p className="text-sm text-slate-700">
                {isCorrect(currentQ, selectedOption ?? '') ? currentQ.explanation : currentQ.incorrectExplanation}
              </p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          {!answerSubmitted ? (
            <Button
              onClick={submitAnswer}
              disabled={!selectedOption}
              className="flex-1"
              size="lg"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion} className="flex-1" size="lg">
              {session.currentIndex + 1 < totalQ ? (
                <><ChevronRight className="w-5 h-5" /> Next Question</>
              ) : (
                <><Trophy className="w-5 h-5" /> See Results</>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS PHASE ────────────────────────────────────────
  if (phase === 'results' && result && session) {
    const { label, color, emoji } = getScoreLabel(result.percentage);
    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">{label}</h2>
          <p className={`text-4xl font-black ${color} mb-2`}>{result.percentage}%</p>
          <p className="text-slate-500 text-sm">{result.score} out of {result.totalQuestions} correct</p>

          <div className="mt-6 w-full">
            <ProgressBar value={result.percentage} color={result.percentage >= 70 ? 'bg-green-500' : result.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'} />
          </div>

          {result.percentage < 70 && (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3 mt-4">
              💪 Keep practising! Try the lesson again or ask the AI Tutor for help.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setReviewIndex(0); setPhase('review'); }} className="flex-1">
              Review Answers
            </Button>
            <Button variant="secondary" onClick={resetQuiz} className="flex-1">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </div>
          <div className="flex gap-3 mt-3 flex-col sm:flex-row">
            <Link href={`/lessons/${quiz.lessonId}`} className="flex-1">
              <Button variant="ghost" className="w-full">Back to Lesson</Button>
            </Link>
            <Link href={`/tutor?lesson=${quiz.lessonId}`} className="flex-1">
              <Button variant="ghost" className="w-full">Ask AI Tutor</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ── REVIEW PHASE ─────────────────────────────────────────
  if (phase === 'review' && result && session) {
    const q = result.questions[reviewIndex];
    const chosen = result.answers[q.id];
    const correct = isCorrect(q, chosen);

    return (
      <div className="max-w-xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Review Answers</h2>
          <span className="text-sm text-slate-500">{reviewIndex + 1} / {result.questions.length}</span>
        </div>
        <Card className="p-6">
          <Badge color={correct ? 'green' : 'red'} className="mb-3">
            {correct ? <><Check className="w-3 h-3" /> Correct</> : <><X className="w-3 h-3" /> Incorrect</>}
          </Badge>
          <p className="font-bold text-slate-800 mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt: AnswerOption) => {
              let cls = 'w-full text-left p-3 rounded-xl border-2 text-sm ';
              if (opt.id === q.correctOptionId) cls += 'border-green-500 bg-green-50 text-green-800 font-semibold';
              else if (opt.id === chosen) cls += 'border-red-400 bg-red-50 text-red-700';
              else cls += 'border-slate-100 text-slate-500';
              return (
                <div key={opt.id} className={cls}>
                  <span className="flex items-center gap-2">
                    {opt.id === q.correctOptionId ? <Check className="w-4 h-4 flex-shrink-0" /> : opt.id === chosen ? <X className="w-4 h-4 flex-shrink-0" /> : <span className="w-4 h-4" />}
                    {opt.text}
                    {opt.id === q.correctOptionId && <span className="ml-auto text-xs">← Correct</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <p className="text-xs font-bold text-violet-700 mb-1">Explanation</p>
            <p className="text-sm text-slate-700">{q.explanation}</p>
          </div>
        </Card>
        <div className="flex gap-3">
          <Button variant="secondary" disabled={reviewIndex === 0} onClick={() => setReviewIndex(i => i - 1)} className="flex-1">
            ← Previous
          </Button>
          {reviewIndex < result.questions.length - 1 ? (
            <Button onClick={() => setReviewIndex(i => i + 1)} className="flex-1">
              Next →
            </Button>
          ) : (
            <Button onClick={() => setPhase('results')} className="flex-1">
              <Trophy className="w-4 h-4" /> Back to Score
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
