import { notFound } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { SUBJECTS } from '@/lib/subjects';
import { LESSONS } from '@/lib/lessons';
import { Card, Badge } from '@/components/ui';
import { BookOpen, Clock } from 'lucide-react';

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

export default async function SubjectPage({ params }: Props) {
  const { subjectId } = await params;
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) notFound();

  const lessons = LESSONS.filter((l) => l.subjectId === subjectId);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className={`rounded-2xl p-6 ${subject.bgColor}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{subject.emoji}</span>
            <div>
              <h1 className={`text-2xl font-black ${subject.color}`}>{subject.name}</h1>
              <p className="text-slate-600 text-sm">{subject.description}</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-2">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} · Grade 4</p>
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-700">Lessons</h2>
          {lessons.map((lesson, idx) => (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card hover className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${subject.bgColor} flex items-center justify-center font-black text-lg ${subject.color} flex-shrink-0`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{lesson.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{lesson.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge color="slate">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} min
                      </Badge>
                      <Badge color="slate">
                        <BookOpen className="w-3 h-3" />
                        {lesson.objectives.length} objectives
                      </Badge>
                      {lesson.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} color="violet">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
