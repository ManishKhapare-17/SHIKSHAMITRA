// ============================================================
// ShikshaMitra AI — Subject Definitions
// ============================================================

import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    emoji: '🔢',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Numbers, shapes, and problem solving',
  },
  {
    id: 'science',
    name: 'Science & EVS',
    emoji: '🔬',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Our world — living things, water, weather, and more',
  },
  {
    id: 'english',
    name: 'English',
    emoji: '📖',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Reading, writing, grammar, and stories',
  },
];

export const SUBJECT_MAP: Record<string, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
);
