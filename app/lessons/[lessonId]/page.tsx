import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import NavBar from '@/components/NavBar';
import VideoLessonPlayer from '@/components/VideoLessonPlayer';
import { LESSON_MAP, LESSONS } from '@/lib/lessons';

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

async function LessonContent({ params }: Props) {
  const { lessonId } = await params;
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) notFound();

  return <VideoLessonPlayer lesson={lesson} />;
}

export default function LessonPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main>
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        }>
          <LessonContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
