'use client';

import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import type { Subject } from '@/lib/types';
import type { Lesson } from '@/lib/types';

interface Props {
  subject: Subject;
  lessons: Lesson[];
}

export default function SubjectClient({ subject, lessons }: Props) {
  const { language: lang } = useLanguage();

  const subjName = subject.nameTranslations?.[lang] || subject.name;
  const subjDesc = subject.descriptionTranslations?.[lang] || subject.description;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className={`rounded-2xl p-6 ${subject.bgColor}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{subject.emoji}</span>
          <div>
            <h1 className={`text-2xl font-black ${subject.color}`}>{subjName}</h1>
            <p className="text-slate-600 text-sm">{subjDesc}</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm mt-2">
          {lessons.length} {t('lessonsUnit', lang)} · {t('gradeLabel', lang)} 4
        </p>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-700">{t('allLessons', lang)}</h2>
        {lessons.map((lesson, idx) => {
          const lessonTitle = lesson.titleTranslations?.[lang] || lesson.title;
          const lessonSummary = lesson.summaryTranslations?.[lang] || lesson.summary;

          return (
            <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
              <Card hover className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${subject.bgColor} flex items-center justify-center font-black text-lg ${subject.color} flex-shrink-0`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{lessonTitle}</h3>
                    <p className="text-sm text-slate-500 mt-1">{lessonSummary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge color="slate">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} {t('minLabel', lang)}
                      </Badge>
                      <Badge color="slate">
                        <BookOpen className="w-3 h-3" />
                        {lesson.objectives.length} {lang === 'hi' ? 'उद्देश्य' : lang === 'mr' ? 'उद्दीष्टे' : 'objectives'}
                      </Badge>
                      {lesson.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} color="violet">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
