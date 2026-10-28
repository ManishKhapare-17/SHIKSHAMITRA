'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card, SectionTitle, Badge, ProgressBar, EmptyState } from '@/components/ui';
import {
  loadProgress, getTopicPerformance, getActivityLast7Days, getRecommendations
} from '@/lib/progress';
import { LESSONS } from '@/lib/lessons';
import { SUBJECTS } from '@/lib/subjects';
import { useLanguage } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import type { PersistedProgress, TopicPerformance, Recommendation } from '@/lib/types';
import { CheckCircle, BookOpen, BarChart2, Flame, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const { language: lang } = useLanguage();
  const [progress, setProgress] = useState<PersistedProgress | null>(null);
  const [topicPerf, setTopicPerf] = useState<TopicPerformance[]>([]);
  const [weekActivity, setWeekActivity] = useState<ReturnType<typeof getActivityLast7Days>>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const p = loadProgress();
        setProgress(p);
        setTopicPerf(getTopicPerformance());
        setWeekActivity(getActivityLast7Days());
        setRecommendations(getRecommendations());
      } catch (err) {
        console.error('Failed to load progress data:', err);
        setProgress(loadProgress());
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!progress) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  const completedLessons = progress.lessonProgress.filter((lp) => !!lp.completedAt);
  const totalQuizAttempts = progress.quizAttempts.length;
  const totalCorrect = progress.quizAttempts.reduce((s, a) => s + a.score, 0);
  const totalAnswered = progress.quizAttempts.reduce((s, a) => s + a.totalQuestions, 0);
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-slate-800">My Progress</h1>
          <p className="text-slate-500 text-sm mt-1">Track your learning journey</p>
          <p className="text-xs text-slate-400 mt-1">⚠️ Progress is saved on this browser/device only and is not synced across devices.</p>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Lessons Done', value: completedLessons.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Lessons Started', value: progress.lessonProgress.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Quiz Attempts', value: totalQuizAttempts, icon: BarChart2, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Day Streak', value: progress.streakDays, icon: Flame, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-4 text-center">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </Card>
          ))}
        </div>

        {/* Overall accuracy */}
        {overallAccuracy !== null && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600" />
                <SectionTitle>Overall Quiz Accuracy</SectionTitle>
              </div>
              <span className={`text-2xl font-black ${overallAccuracy >= 70 ? 'text-green-600' : overallAccuracy >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {overallAccuracy}%
              </span>
            </div>
            <ProgressBar
              value={overallAccuracy}
              color={overallAccuracy >= 70 ? 'bg-green-500' : overallAccuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'}
            />
            <p className="text-xs text-slate-500 mt-2">{totalCorrect} correct out of {totalAnswered} total questions</p>
          </Card>
        )}

        {/* Subject progress */}
        <section>
          <SectionTitle className="mb-3">Progress by Subject</SectionTitle>
          <div className="space-y-3">
            {SUBJECTS.map((subject) => {
              const subjectLessons = LESSONS.filter((l) => l.subjectId === subject.id);
              const done = completedLessons.filter((lp) =>
                subjectLessons.some((l) => l.id === lp.lessonId)
              ).length;
              const pct = subjectLessons.length > 0 ? Math.round((done / subjectLessons.length) * 100) : 0;
              const subjectAttempts = progress.quizAttempts.filter((a) => a.subjectId === subject.id);
              const subjectCorrect = subjectAttempts.reduce((s, a) => s + a.score, 0);
              const subjectTotal = subjectAttempts.reduce((s, a) => s + a.totalQuestions, 0);
              const subjectAccuracy = subjectTotal > 0 ? Math.round((subjectCorrect / subjectTotal) * 100) : null;

              const subjName = subject.nameTranslations?.[lang] || subject.name;
              return (
                <Card key={subject.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{subject.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800 text-sm">{subjName}</span>
                        <span className="text-sm font-semibold text-slate-600">{done}/{subjectLessons.length} {t('lessonsUnit', lang)}</span>
                      </div>
                      <ProgressBar
                        value={pct}
                        color={subject.id === 'mathematics' ? 'bg-blue-500' : subject.id === 'science' ? 'bg-green-500' : 'bg-purple-500'}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  {subjectAccuracy !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">Quiz accuracy: <strong>{subjectAccuracy}%</strong> ({subjectAttempts.length} attempts)</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Topic performance */}
        {topicPerf.length > 0 && (
          <section>
            <SectionTitle className="mb-3">Topic Performance</SectionTitle>
            <div className="space-y-2">
              {topicPerf.map((tp) => {
                const subject = SUBJECTS.find((s) => s.id === tp.subjectId);
                const targetLesson = LESSONS.find((l) => l.id === tp.lessonId);
                const lessonTitle = targetLesson?.titleTranslations?.[lang] || tp.lessonTitle;
                return (
                  <Card key={tp.lessonId} className="p-4 flex items-center gap-4">
                    <span className="text-xl">{subject?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{lessonTitle}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <ProgressBar value={tp.bestScore} color={tp.bestScore >= 70 ? 'bg-green-500' : tp.bestScore >= 50 ? 'bg-amber-500' : 'bg-red-500'} className="w-24" />
                        <span className="text-xs text-slate-500">Best: {tp.bestScore}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">{tp.attempts} attempt{tp.attempts !== 1 ? 's' : ''}</span>
                      {tp.needsPractice && (
                        <div className="mt-1">
                          <Badge color="amber">Needs Practice</Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <SectionTitle>Recommended Next Steps</SectionTitle>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec) => {
                const subject = SUBJECTS.find((s) => s.id === rec.subjectId);
                const href = rec.type === 'retry_quiz' ? `/quiz/${rec.lessonId}` : `/lessons/${rec.lessonId}`;
                return (
                  <Link key={rec.lessonId + rec.type} href={href}>
                    <Card hover className="p-4 flex items-center gap-3">
                      <span className="text-xl">{subject?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{rec.lessonTitle}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
                      </div>
                      <Badge color={rec.type === 'retry_quiz' ? 'amber' : rec.type === 'review_lesson' ? 'blue' : 'green'}>
                        {rec.type === 'retry_quiz' ? 'Retry' : rec.type === 'review_lesson' ? 'Continue' : 'Start'}
                      </Badge>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Weekly activity */}
        <section>
          <SectionTitle className="mb-3">This Week&apos;s Activity</SectionTitle>
          <Card className="p-5">
            <div className="flex items-end gap-2 h-24 mb-2">
              {weekActivity.map((day) => {
                const maxVal = Math.max(...weekActivity.map((d) => d.quizAttempts + d.lessonsCompleted), 1);
                const total = day.quizAttempts + day.lessonsCompleted;
                const h = Math.max(4, Math.round((total / maxVal) * 80));
                const label = new Date(day.date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' });
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${total} activities on ${day.date}`}>
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? 'bg-violet-500' : 'bg-violet-200'}`}
                      style={{ height: h }}
                    />
                    <span className={`text-xs ${isToday ? 'font-bold text-violet-700' : 'text-slate-400'}`}>{label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 text-center">Combined lessons + quiz activity per day</p>
          </Card>
        </section>

        {/* Empty state if no activity */}
        {completedLessons.length === 0 && totalQuizAttempts === 0 && (
          <EmptyState
            emoji="🌱"
            title="No activity yet!"
            message="Start a lesson or take a quiz to see your progress here."
            action={
              <Link href="/subjects">
                <button className="bg-violet-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors">
                  Browse Lessons
                </button>
              </Link>
            }
          />
        )}
      </main>
    </div>
  );
}
