import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import NavBar from '@/components/NavBar';
import QuizInterface from '@/components/QuizInterface';
import { QUIZ_MAP, QUIZZES } from '@/lib/quizzes';
import { LESSON_MAP } from '@/lib/lessons';

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateStaticParams() {
  return QUIZZES.map((q) => ({ lessonId: q.lessonId }));
}

async function QuizContent({ params }: Props) {
  const { lessonId } = await params;
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) notFound();

  const quiz = QUIZ_MAP[lesson.quizId];
  if (!quiz) notFound();

  return <QuizInterface quiz={quiz} lessonTitle={lesson.title} />;
}

export default function QuizPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main>
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        }>
          <QuizContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
