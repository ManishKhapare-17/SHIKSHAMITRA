import { notFound } from 'next/navigation';
import NavBar from '@/components/NavBar';
import LessonPlayer from '@/components/LessonPlayer';
import { LESSON_MAP, LESSONS } from '@/lib/lessons';

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) notFound();

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main>
        <LessonPlayer lesson={lesson} />
      </main>
    </div>
  );
}
