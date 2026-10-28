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

export default async function QuizPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) notFound();

  const quiz = QUIZ_MAP[lesson.quizId];
  if (!quiz) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main>
        <QuizInterface quiz={quiz} lessonTitle={lesson.title} />
      </main>
    </div>
  );
}
