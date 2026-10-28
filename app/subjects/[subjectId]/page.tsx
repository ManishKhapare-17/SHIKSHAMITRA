import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { SUBJECTS } from '@/lib/subjects';
import { LESSONS } from '@/lib/lessons';
import SubjectClient from './SubjectClient';

interface Props {
  params: Promise<{ subjectId: string }>;
}

export async function generateStaticParams() {
  return [
    { subjectId: 'mathematics' },
    { subjectId: 'science' },
    { subjectId: 'english' },
  ];
}

async function SubjectContent({ params }: Props) {
  const { subjectId } = await params;
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) notFound();

  const lessons = LESSONS.filter((l) => l.subjectId === subjectId);

  return <SubjectClient subject={subject} lessons={lessons} />;
}

export default function SubjectPage({ params }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main>
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        }>
          <SubjectContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
