export interface QuestionModel {
  id: string;
  type: string;
  difficulty: string;
  category: string;
  question: string;
  answers: [string];
  isCorrect: boolean;
  selectedAnswer: string;
}
