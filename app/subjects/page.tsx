import NavBar from '@/components/NavBar';
import { SUBJECTS } from '@/lib/subjects';
import { LESSONS } from '@/lib/lessons';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { BookOpen } from 'lucide-react';

export default function SubjectsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pt-16">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Subjects</h1>
          <p className="text-slate-500 text-sm mt-1">Choose a subject to explore lessons and quizzes</p>
        </div>
        <div className="space-y-8">
          {SUBJECTS.map((subject) => {
            const subjectLessons = LESSONS.filter((l) => l.subjectId === subject.id);
            return (
              <section key={subject.id}>
                <Link href={`/subjects/${subject.id}`}>
                  <div className={`flex items-center gap-3 mb-4 p-4 rounded-2xl ${subject.bgColor} hover:opacity-90 transition-opacity`}>
                    <span className="text-3xl">{subject.emoji}</span>
                    <div>
                      <h2 className={`text-xl font-black ${subject.color}`}>{subject.name}</h2>
                      <p className="text-sm text-slate-600">{subject.description}</p>
                    </div>
                  </div>
                </Link>
                <div className="space-y-2 pl-2">
                  {subjectLessons.map((lesson) => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                      <Card hover className="p-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm">{lesson.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{lesson.summary}</p>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{lesson.durationMinutes} min</span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
