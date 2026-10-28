'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, Star, TrendingUp, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Logo from '@/components/Logo';
import OnlineIndicator from '@/components/OnlineIndicator';
import { Card, Badge, Button, SectionTitle, ProgressBar } from '@/components/ui';
import { SUBJECTS } from '@/lib/subjects';
import { LESSONS } from '@/lib/lessons';
import { loadProgress, getActivityLast7Days, getRecommendations, isStorageAvailable } from '@/lib/progress';
import type { PersistedProgress, Recommendation } from '@/lib/types';

const DAILY_GOAL_LESSONS = 1;

export default function DashboardPage() {
  const [progress, setProgress] = useState<PersistedProgress | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [weekActivity, setWeekActivity] = useState<{ date: string; quizAttempts: number }[]>([]);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStorageOk(isStorageAvailable());
      const p = loadProgress();
      setProgress(p);
      setRecommendations(getRecommendations());
      setWeekActivity(getActivityLast7Days());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const completedLessons = progress.lessonProgress.filter((lp) => !!lp.completedAt);
  const totalQuizAttempts = progress.quizAttempts.length;
  const avgScore = totalQuizAttempts > 0
    ? Math.round(
        (progress.quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0)) /
          totalQuizAttempts
      )
    : null;

  const todayCompleted = completedLessons.filter(
    (lp) => lp.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;
  const dailyGoalProgress = Math.min(100, (todayCompleted / DAILY_GOAL_LESSONS) * 100);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <OnlineIndicator />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
        {/* ── Welcome Banner ────────────────────────────────── */}
        <section>
          <div className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c026d3 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 right-16 w-24 h-24 bg-white/10 rounded-full" />
            <Logo size="sm" showTagline={false} />
            <div className="mt-4">
              <h1 className="text-2xl md:text-3xl font-black leading-tight">
                Welcome back, {progress.studentName}! 👋
              </h1>
              <p className="mt-1 text-violet-200 text-sm md:text-base">
                Grade {progress.gradeLevel} · Let&apos;s learn something amazing today
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              <div className="bg-white/20 rounded-xl px-4 py-3 flex items-center gap-3 min-w-32">
                <Flame className="w-6 h-6 text-amber-300" />
                <div>
                  <div className="text-xl font-black">{progress.streakDays}</div>
                  <div className="text-xs text-violet-200">Day streak</div>
                </div>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-3 flex items-center gap-3 min-w-32">
                <CheckCircle className="w-6 h-6 text-emerald-300" />
                <div>
                  <div className="text-xl font-black">{completedLessons.length}</div>
                  <div className="text-xs text-violet-200">Lessons done</div>
                </div>
              </div>
              {avgScore !== null && (
                <div className="bg-white/20 rounded-xl px-4 py-3 flex items-center gap-3 min-w-32">
                  <Star className="w-6 h-6 text-yellow-300" />
                  <div>
                    <div className="text-xl font-black">{avgScore}%</div>
                    <div className="text-xs text-violet-200">Quiz average</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Daily Goal ────────────────────────────────────── */}
        <section>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                <SectionTitle>Today&apos;s Goal</SectionTitle>
              </div>
              <Badge color={dailyGoalProgress >= 100 ? 'green' : 'violet'}>
                {todayCompleted}/{DAILY_GOAL_LESSONS} lessons
              </Badge>
            </div>
            <ProgressBar value={dailyGoalProgress} color="bg-violet-500" />
            <p className="text-xs text-slate-500 mt-2">
              {dailyGoalProgress >= 100
                ? '🎉 Goal complete! Great work today!'
                : `Complete ${DAILY_GOAL_LESSONS - todayCompleted} more lesson${DAILY_GOAL_LESSONS - todayCompleted !== 1 ? 's' : ''} to reach today's goal`}
            </p>
          </Card>
        </section>

        {!storageOk && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ Your browser does not support saving progress locally. Your learning activity will not be saved between visits.
          </div>
        )}

        {/* ── Recommended ───────────────────────────────────── */}
        {recommendations.length > 0 && (
          <section>
            <SectionTitle className="mb-3">Recommended for You</SectionTitle>
            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec) => {
                const subject = SUBJECTS.find((s) => s.id === rec.subjectId);
                const lessonHref =
                  rec.type === 'retry_quiz'
                    ? `/quiz/${rec.lessonId}`
                    : `/lessons/${rec.lessonId}`;
                return (
                  <Link key={rec.lessonId + rec.type} href={lessonHref}>
                    <Card hover className="p-4 flex items-center gap-4">
                      <span className="text-2xl">{subject?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{rec.lessonTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
                      </div>
                      <Badge color={rec.type === 'retry_quiz' ? 'amber' : rec.type === 'review_lesson' ? 'blue' : 'green'}>
                        {rec.type === 'retry_quiz' ? 'Retry Quiz' : rec.type === 'review_lesson' ? 'Continue' : 'Start'}
                      </Badge>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Subjects ──────────────────────────────────────── */}
        <section>
          <SectionTitle className="mb-3">Subjects</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUBJECTS.map((subject) => {
              const subjectLessons = LESSONS.filter((l) => l.subjectId === subject.id);
              const completed = completedLessons.filter((lp) =>
                subjectLessons.some((l) => l.id === lp.lessonId)
              ).length;
              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`}>
                  <Card hover className="p-5 h-full">
                    <div className={`w-12 h-12 rounded-xl ${subject.bgColor} flex items-center justify-center text-2xl mb-3`}>
                      {subject.emoji}
                    </div>
                    <h3 className="font-bold text-slate-800">{subject.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{subject.description}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{completed}/{subjectLessons.length} lessons</span>
                      </div>
                      <ProgressBar
                        value={subjectLessons.length > 0 ? (completed / subjectLessons.length) * 100 : 0}
                        color={subject.id === 'mathematics' ? 'bg-blue-500' : subject.id === 'science' ? 'bg-green-500' : 'bg-purple-500'}
                      />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Recent Lessons ────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>All Lessons</SectionTitle>
            <Link href="/subjects" className="text-sm text-violet-600 font-semibold hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {LESSONS.map((lesson) => {
              const subject = SUBJECTS.find((s) => s.id === lesson.subjectId);
              const isCompleted = completedLessons.some((lp) => lp.lessonId === lesson.id);
              const isStarted = progress.lessonProgress.some((lp) => lp.lessonId === lesson.id);
              return (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <Card hover className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${subject?.bgColor ?? 'bg-slate-100'} flex items-center justify-center text-xl flex-shrink-0`}>
                      {subject?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{lesson.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{subject?.name} · Grade {lesson.grade} · {lesson.durationMinutes} min</p>
                    </div>
                    {isCompleted ? (
                      <Badge color="green"><CheckCircle className="w-3 h-3" /> Done</Badge>
                    ) : isStarted ? (
                      <Badge color="blue">In Progress</Badge>
                    ) : (
                      <Badge color="slate">Start</Badge>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── AI Tutor CTA ──────────────────────────────────── */}
        <section>
          <Card className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-violet-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">Have a question? Ask the AI Tutor!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Got stuck on something? Our AI tutor explains concepts step by step, just like a patient teacher.
                </p>
                <div className="mt-3">
                  <Link href="/tutor">
                    <Button size="sm">
                      <Brain className="w-4 h-4" />
                      Open AI Tutor
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mt-2">Requires internet connection and API key configuration</p>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Activity (last 7 days) ────────────────────────── */}
        {totalQuizAttempts > 0 && (
          <section>
            <SectionTitle className="mb-3">Recent Quiz Scores</SectionTitle>
            <div className="space-y-2">
              {progress.quizAttempts.slice(-5).reverse().map((attempt) => {
                const lesson = LESSONS.find((l) => l.id === attempt.lessonId);
                const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                const subject = SUBJECTS.find((s) => s.id === attempt.subjectId);
                return (
                  <Card key={attempt.id} className="p-4 flex items-center gap-4">
                    <span className="text-xl">{subject?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-700 truncate">{lesson?.title ?? attempt.lessonId}</p>
                      <p className="text-xs text-slate-500">{attempt.difficulty} · {new Date(attempt.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-lg ${pct >= 70 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {pct}%
                      </span>
                      <p className="text-xs text-slate-400">{attempt.score}/{attempt.totalQuestions}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Week Activity chart (simple bar) */}
        {weekActivity.some((d) => d.quizAttempts > 0) && (
          <section>
            <SectionTitle className="mb-3">This Week</SectionTitle>
            <Card className="p-4">
              <div className="flex items-end gap-2 h-16">
                {weekActivity.map((day) => {
                  const h = Math.max(4, day.quizAttempts * 20);
                  const label = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-violet-400 rounded-t"
                        style={{ height: h }}
                        title={`${day.quizAttempts} quiz(zes) on ${day.date}`}
                      />
                      <span className="text-xs text-slate-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
