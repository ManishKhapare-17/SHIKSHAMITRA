'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle, ChevronRight, ChevronLeft, Brain, PlayCircle,
  Target, Lightbulb, BookOpen, ArrowLeft, Check, X
} from 'lucide-react';
import { Button, Badge, Card, ProgressBar } from '@/components/ui';
import { FractionDiagram, WaterCycleDiagram, NounDiagram } from '@/components/LessonVisuals';
import type { Lesson } from '@/lib/types';
import { SUBJECT_MAP } from '@/lib/subjects';
import { markLessonStarted, markLessonCompleted, isLessonCompleted } from '@/lib/progress';

interface Props {
  lesson: Lesson;
}

type Phase = 'intro' | 'steps' | 'knowledge-check' | 'complete';

const VISUAL_MAP: Record<string, React.FC> = {
  'math-fractions-g4': FractionDiagram,
  'sci-water-cycle-g4': WaterCycleDiagram,
  'eng-nouns-g4': NounDiagram,
};

export default function LessonPlayer({ lesson }: Props) {
  const subject = SUBJECT_MAP[lesson.subjectId];

  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [kqSelected, setKqSelected] = useState<number | null>(null);
  const [kqSubmitted, setKqSubmitted] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    markLessonStarted(lesson.id, lesson.subjectId, lesson.grade);
    const timer = setTimeout(() => {
      setAlreadyCompleted(isLessonCompleted(lesson.id));
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson.id, lesson.subjectId, lesson.grade]);

  const handleComplete = useCallback(() => {
    markLessonCompleted(lesson.id);
    setAlreadyCompleted(true);
    setPhase('complete');
  }, [lesson.id]);

  const totalSteps = lesson.steps.length;
  const VisualComponent = VISUAL_MAP[lesson.id];

  const phaseProgress =
    phase === 'intro' ? 15
    : phase === 'steps' ? 15 + Math.round(((stepIndex + 1) / totalSteps) * 60)
    : phase === 'knowledge-check' ? 80
    : 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Back */}
      <Link href={`/subjects/${lesson.subjectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to {subject.name}
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge color={lesson.subjectId === 'mathematics' ? 'blue' : lesson.subjectId === 'science' ? 'green' : 'violet'}>
            {subject.emoji} {subject.name}
          </Badge>
          <Badge color="slate">Grade {lesson.grade}</Badge>
          {alreadyCompleted && <Badge color="green"><CheckCircle className="w-3 h-3" /> Completed</Badge>}
        </div>
        <h1 className="text-2xl font-black text-slate-800">{lesson.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{lesson.summary}</p>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{phaseProgress}%</span>
          </div>
          <ProgressBar value={phaseProgress} />
        </div>
      </div>

      {/* ── INTRO PHASE ───────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="space-y-5">
          {/* Learning objectives */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-violet-600" />
              <h2 className="font-bold text-slate-800">What you&apos;ll learn</h2>
            </div>
            <ul className="space-y-2">
              {lesson.objectives.map((obj) => (
                <li key={obj.id} className="flex items-start gap-2 text-sm text-slate-600">
                  <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  {obj.description}
                </li>
              ))}
            </ul>
          </Card>

          {/* Explanation */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">Explanation</h2>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line lesson-prose">
              {lesson.explanation}
            </div>
          </Card>

          {/* Visual */}
          {VisualComponent && (
            <Card className="p-5">
              <h2 className="font-bold text-slate-800 mb-4">📊 Visual Model</h2>
              <VisualComponent />
            </Card>
          )}

          {/* Real-life example */}
          <Card className="p-5 bg-amber-50 border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-amber-800">Real-life Example</h2>
            </div>
            <div className="text-sm text-amber-900 leading-relaxed whitespace-pre-line">
              {lesson.realLifeExample}
            </div>
          </Card>

          <Button onClick={() => setPhase('steps')} className="w-full" size="lg">
            Start Step-by-Step Explanation
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* ── STEPS PHASE ──────────────────────────────────────── */}
      {phase === 'steps' && (
        <div className="space-y-5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Step {stepIndex + 1} of {totalSteps}</span>
            <span>{lesson.steps[stepIndex].title}</span>
          </div>

          <Card className="p-6">
            <h2 className="text-lg font-black text-slate-800 mb-3">{lesson.steps[stepIndex].title}</h2>
            <p className="text-slate-700 text-sm leading-relaxed">{lesson.steps[stepIndex].content}</p>
            {lesson.steps[stepIndex].example && (
              <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs font-bold text-violet-600 mb-1">Example</p>
                <p className="text-sm text-violet-900">{lesson.steps[stepIndex].example}</p>
              </div>
            )}
          </Card>

          {/* Step navigation */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => stepIndex > 0 ? setStepIndex(stepIndex - 1) : setPhase('intro')}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {stepIndex === 0 ? 'Back to Intro' : 'Previous'}
            </Button>
            {stepIndex < totalSteps - 1 ? (
              <Button onClick={() => setStepIndex(stepIndex + 1)} className="flex-1">
                Next Step
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => setPhase('knowledge-check')} className="flex-1">
                Knowledge Check
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Link href={`/tutor?lesson=${lesson.id}`}>
              <Button variant="ghost" size="sm">
                <Brain className="w-4 h-4" />
                Ask AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── KNOWLEDGE CHECK PHASE ────────────────────────────── */}
      {phase === 'knowledge-check' && (
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-sm font-black text-violet-700">?</span>
              </div>
              <h2 className="font-bold text-slate-800">Quick Knowledge Check</h2>
            </div>
            <p className="text-slate-700 font-semibold mb-5">{lesson.knowledgeCheck.question}</p>

            <div className="space-y-3">
              {lesson.knowledgeCheck.options.map((opt, idx) => {
                const isSelected = kqSelected === idx;
                const isCorrect = idx === lesson.knowledgeCheck.correctIndex;
                let classes = 'w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ';
                if (!kqSubmitted) {
                  classes += isSelected
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700';
                } else {
                  if (isCorrect) classes += 'border-green-500 bg-green-50 text-green-800';
                  else if (isSelected && !isCorrect) classes += 'border-red-400 bg-red-50 text-red-700';
                  else classes += 'border-slate-200 text-slate-500';
                }
                return (
                  <button
                    key={idx}
                    className={classes}
                    disabled={kqSubmitted}
                    onClick={() => setKqSelected(idx)}
                    aria-pressed={isSelected}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-black flex-shrink-0">
                        {kqSubmitted && isCorrect ? <Check className="w-3 h-3" /> : kqSubmitted && isSelected && !isCorrect ? <X className="w-3 h-3" /> : String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {kqSubmitted && (
              <div className={`mt-4 p-4 rounded-xl ${kqSelected === lesson.knowledgeCheck.correctIndex ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <p className="text-sm font-bold mb-1">
                  {kqSelected === lesson.knowledgeCheck.correctIndex ? '✅ Correct!' : '📚 Not quite!'}
                </p>
                <p className="text-sm text-slate-700">{lesson.knowledgeCheck.explanation}</p>
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setPhase('steps')} className="flex-1">
              <ChevronLeft className="w-4 h-4" />
              Review Steps
            </Button>
            {!kqSubmitted ? (
              <Button
                onClick={() => setKqSubmitted(true)}
                disabled={kqSelected === null}
                className="flex-1"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1">
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </Button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link href={`/quiz/${lesson.id}`}>
              <Button variant="secondary" size="sm">
                <PlayCircle className="w-4 h-4" />
                Start Practice Quiz
              </Button>
            </Link>
            <Link href={`/tutor?lesson=${lesson.id}`}>
              <Button variant="ghost" size="sm">
                <Brain className="w-4 h-4" />
                Ask AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── COMPLETE PHASE ────────────────────────────────────── */}
      {phase === 'complete' && (
        <div className="space-y-5 text-center">
          <Card className="p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Lesson Complete!</h2>
            <p className="text-slate-600 mb-2">
              You finished <strong>{lesson.title}</strong>
            </p>
            <p className="text-sm text-slate-500">Great work! Your progress has been saved.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
              <Link href={`/quiz/${lesson.id}`}>
                <Button size="lg">
                  <PlayCircle className="w-5 h-5" />
                  Take Practice Quiz
                </Button>
              </Link>
              <Link href={`/tutor?lesson=${lesson.id}`}>
                <Button variant="secondary" size="lg">
                  <Brain className="w-5 h-5" />
                  Ask AI Tutor
                </Button>
              </Link>
            </div>
            <div className="mt-4">
              <Link href="/subjects" className="text-sm text-violet-600 hover:underline">
                ← Back to all subjects
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
