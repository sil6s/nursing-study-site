export type QuestionType =
  | "multiple" | "sata" | "order" | "true_false" | "fill_blank"
  | "case_study" | "priority" | "med_calc" | "matching";

export type Difficulty = "easy" | "medium" | "hard" | "nclex";
export type QuizMode = "immediate" | "test";
export type AnswerValue = string | string[] | number | Record<string, string>;

export interface StudyTopic {
  title: string;
  description: string;
  keyConcepts: string[];
  priority: "high" | "medium" | "low";
  sourceReference?: string | null;
}

export interface NursingQuestion {
  _id?: string;
  type: QuestionType;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  nclexCategory: string | null;
  question: string;
  options: string[];
  correctAnswer: AnswerValue;
  rationale: string;
  wrongAnswerRationales: Record<string, string>;
  tags: string[];
  sourceReference: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "archived";
  questionCount: number;
  difficulty: Difficulty | "mixed";
  sourceType: "topic" | "notes" | "material" | "mixed";
  createdAt: number;
  updatedAt: number;
}

export interface QuizAttempt {
  _id: string;
  quizId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  completedAt?: number;
  startedAt: number;
  status: "in_progress" | "completed" | "abandoned";
}
