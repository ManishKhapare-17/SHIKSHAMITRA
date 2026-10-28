// ============================================================
// ShikshaMitra AI — Subject Definitions (Multilingual)
// ============================================================

import type { Subject } from './types';

export const SUBJECTS: Subject[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    nameTranslations: {
      en: 'Mathematics',
      hi: 'गणित',
      mr: 'गणित',
    },
    emoji: '🔢',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Numbers, shapes, and problem solving',
    descriptionTranslations: {
      en: 'Numbers, shapes, and problem solving',
      hi: 'संख्याएं, आकृतियां और हल करने का कौशल',
      mr: 'संख्या, आकार आणि प्रश्न सोडवण्याचे कौशल्य',
    },
  },
  {
    id: 'science',
    name: 'Science & EVS',
    nameTranslations: {
      en: 'Science & EVS',
      hi: 'विज्ञान एवं पर्यावरण',
      mr: 'विज्ञान आणि परिसर अभ्यास',
    },
    emoji: '🔬',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Our world — living things, water, weather, and more',
    descriptionTranslations: {
      en: 'Our world — living things, water, weather, and more',
      hi: 'हमारी दुनिया — सजीव, जल, मौसम और पर्यावरण',
      mr: 'आपले जग — सजीव, पाणी, हवामान आणि निसर्ग',
    },
  },
  {
    id: 'english',
    name: 'English',
    nameTranslations: {
      en: 'English',
      hi: 'अंग्रेजी',
      mr: 'इंग्रजी',
    },
    emoji: '📖',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    description: 'Reading, writing, grammar, and stories',
    descriptionTranslations: {
      en: 'Reading, writing, grammar, and stories',
      hi: 'पढ़ना, लिखना, व्याकरण और कहानियां',
      mr: 'वाचन, लेखन, व्याकरण आणि गोष्टी',
    },
  },
];

export const SUBJECT_MAP: Record<string, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s])
);
