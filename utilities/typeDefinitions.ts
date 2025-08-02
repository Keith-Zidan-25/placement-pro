export interface Question {
    _id: string;
    question: string;
    options: string[];
}

export interface QuizData {
    title: string | undefined;
    totalQuestions: number | undefined;
    score: number | undefined | null;
    duration: number | undefined | null; // minutes
    questions: Question[];
}

export interface Quiz {
  title: string;
  description: string;
  timelimit: number;
  questionCount: number;
  score: number;
  imagePath: string;
  difficulty: number;
}