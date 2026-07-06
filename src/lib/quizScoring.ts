import type { AnswerValue, NursingQuestion } from "./types";

export function isCorrect(question: NursingQuestion, answer: AnswerValue | undefined): boolean {
  if (answer === undefined) return false;
  if (question.type === "sata" || question.type === "order") {
    if (!Array.isArray(answer) || !Array.isArray(question.correctAnswer)) return false;
    const actual = question.type === "sata" ? [...answer].sort() : answer;
    const expected = question.type === "sata" ? [...question.correctAnswer].map(String).sort() : question.correctAnswer.map(String);
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  if (question.type === "matching") return JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
  return String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
}

export function scoreQuiz(questions: NursingQuestion[], answers: Record<number, AnswerValue>) {
  const correctCount = questions.filter((q, index) => isCorrect(q, answers[index])).length;
  return { correctCount, total: questions.length, score: questions.length ? Math.round(correctCount / questions.length * 100) : 0 };
}
