// ============================================================
// ShikshaMitra AI — Shared TypeScript Types
// ============================================================

export type SubjectId = 'mathematics' | 'science' | 'english';

export interface Subject {
  id: SubjectId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface LearningObjective {
  id: string;
  description: string;
}

export interface LessonStep {
  title: string;
  content: string;
  example?: string;
}

export interface KnowledgeCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  subjectId: SubjectId;
  grade: number;
  title: string;
  summary: string;
  objectives: LearningObjective[];
  explanation: string;
  realLifeExample: string;
  steps: LessonStep[];
  knowledgeCheck: KnowledgeCheck;
  quizId: string;
  durationMinutes: number;
  tags: string[];
}

// ──── Quiz Types ────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  id: string;   // 'a' | 'b' | 'c' | 'd'
  text: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  difficulty: Difficulty;
  question: string;
  options: AnswerOption[];
  correctOptionId: string;
  explanation: string;
  incorrectExplanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  subjectId: SubjectId;
  title: string;
  questions: {
    easy: QuizQuestion[];
    medium: QuizQuestion[];
    hard: QuizQuestion[];
  };
}

// ──── Progress & Activity Types ──────────────────────────────

export interface LessonProgress {
  lessonId: string;
  subjectId: SubjectId;
  startedAt: string;       // ISO timestamp
  completedAt?: string;    // ISO timestamp — undefined means in-progress
  grade: number;
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
}

export interface TutorRequest {
  messages: Array<{ role: TutorRole; content: string }>;
  lessonContext?: {
    lessonId: string;
    lessonTitle: string;
    subjectName: string;
  };
}

// ──── Persisted State Schema ─────────────────────────────────

export const STORAGE_SCHEMA_VERSION = 2;

export interface PersistedProgress {
  schemaVersion: number;
  studentName: string;
  gradeLevel: number;
  lessonProgress: LessonProgress[];
  quizAttempts: QuizAttempt[];
  streakDays: number;
  lastActiveDate: string;   // YYYY-MM-DD
  createdAt: string;
}
