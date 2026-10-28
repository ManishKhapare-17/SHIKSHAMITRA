// ============================================================
// ShikshaMitra AI — Shared TypeScript Types
// ============================================================

export type SubjectId = 'mathematics' | 'science' | 'english';
export type Language = 'en' | 'hi' | 'mr';
export type TeacherPersona = 'female' | 'male';

export interface Subject {
  id: SubjectId;
  name: string;
  nameTranslations?: Record<Language, string>;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  descriptionTranslations?: Record<Language, string>;
}

export interface LearningObjective {
  id: string;
  description: string;
  descriptionTranslations?: Record<Language, string>;
}

export interface LessonStep {
  title: string;
  titleTranslations?: Record<Language, string>;
  content: string;
  contentTranslations?: Record<Language, string>;
  narrationText?: Record<Language, string>;
  example?: string;
  exampleTranslations?: Record<Language, string>;
  visualDescription?: string;
}

export interface KnowledgeCheck {
  question: string;
  questionTranslations?: Record<Language, string>;
  options: string[];
  optionsTranslations?: Record<Language, string[]>;
  correctIndex: number;
  explanation: string;
  explanationTranslations?: Record<Language, string>;
}

export interface ShortNotes {
  summary: string;
  summaryTranslations?: Record<Language, string>;
  keyPoints: string[];
  keyPointsTranslations?: Record<Language, string[]>;
  definitions: Array<{ term: string; meaning: string }>;
  definitionsTranslations?: Record<Language, Array<{ term: string; meaning: string }>>;
  rememberTip: string;
  rememberTipTranslations?: Record<Language, string>;
}

export interface Lesson {
  id: string;
  subjectId: SubjectId;
  grade: number;
  title: string;
  titleTranslations?: Record<Language, string>;
  summary: string;
  summaryTranslations?: Record<Language, string>;
  objectives: LearningObjective[];
  explanation: string;
  explanationTranslations?: Record<Language, string>;
  realLifeExample: string;
  realLifeExampleTranslations?: Record<Language, string>;
  steps: LessonStep[];
  knowledgeCheck: KnowledgeCheck;
  shortNotes?: ShortNotes;
  quizId: string;
  durationMinutes: number;
  tags: string[];
}

// ──── Quiz Types ────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  id: string;   // 'a' | 'b' | 'c' | 'd'
  text: string;
  textTranslations?: Record<Language, string>;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  difficulty: Difficulty;
  question: string;
  questionTranslations?: Record<Language, string>;
  options: AnswerOption[];
  correctOptionId: string;
  explanation: string;
  explanationTranslations?: Record<Language, string>;
  incorrectExplanation: string;
  incorrectExplanationTranslations?: Record<Language, string>;
}

export interface Quiz {
  id: string;
  lessonId: string;
  subjectId: SubjectId;
  title: string;
  titleTranslations?: Record<Language, string>;
  questions: {
    easy: QuizQuestion[];
    medium: QuizQuestion[];
    hard: QuizQuestion[];
  };
}

// ──── Progress & Activity Types ──────────────────────────────

export interface LessonCheckpoint {
  lessonId: string;
  stepIndex: number;
  charIndex?: number;
  playbackSpeed?: number;
  language?: Language;
  isPlaying?: boolean;
  lastUpdatedAt?: string; // ISO timestamp
  updatedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  subjectId: SubjectId;
  startedAt: string;       // ISO timestamp
  completedAt?: string;    // ISO timestamp — undefined means in-progress
  grade: number;
  lastStudiedAt?: string;
  checkpoint?: LessonCheckpoint;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  lessonId: string;
  subjectId: SubjectId;
  difficulty: Difficulty;
  score: number;           // number of correct answers
  totalQuestions: number;
  answers: Record<string, string>;   // questionId → chosen optionId
  completedAt: string;     // ISO timestamp
}

export interface StudentActivity {
  date: string;            // YYYY-MM-DD
  lessonsStarted: number;
  lessonsCompleted: number;
  quizAttempts: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface TopicPerformance {
  lessonId: string;
  lessonTitle: string;
  subjectId: SubjectId;
  attempts: number;
  bestScore: number;       // percentage 0–100
  latestScore: number;     // percentage 0–100
  needsPractice: boolean;
}

export interface Recommendation {
  type: 'retry_quiz' | 'review_lesson' | 'next_lesson';
  lessonId: string;
  lessonTitle: string;
  subjectId: SubjectId;
  reason: string;
  priority: number;        // 1 = highest
}

// ──── AI Tutor Types ─────────────────────────────────────────

export type TutorRole = 'user' | 'assistant';

export interface TutorMessage {
  id: string;
  role: TutorRole;
  content: string;
  timestamp: string;       // ISO timestamp
  isError?: boolean;
  isOffline?: boolean;
  isTopicRedirect?: boolean;
}

export interface TutorRequest {
  messages: Array<{ role: TutorRole; content: string }>;
  language?: Language;
  lessonContext?: {
    lessonId: string;
    lessonTitle: string;
    subjectName: string;
    currentSection?: string;
    documentContent?: string;
    relevantContent?: string;
  };
}

// ──── PDF / Document Learning Types ──────────────────────────

export interface DocumentLearningData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  extractedText: string;
  wordCount: number;
  pageCount: number;
  isScanned?: boolean;
  ocrApplied?: boolean;
  explanation?: string;
  summary?: string;
  keyConcepts?: string[];
  realLifeExamples?: string[];
  quiz?: QuizQuestion[];
  generatedLesson?: Lesson;
}

// ──── Persisted State Schema ─────────────────────────────────

export const STORAGE_SCHEMA_VERSION = 3;

export interface PersistedProgress {
  schemaVersion: number;
  studentName: string;
  gradeLevel: number;
  preferredLanguage: Language;
  teacherPersona: TeacherPersona;
  speechRate: number;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  documents: DocumentLearningData[];
  checkpoints?: Record<string, LessonCheckpoint>;
  streakDays: number;
  lastActiveDate: string;   // YYYY-MM-DD
  createdAt: string;
}
