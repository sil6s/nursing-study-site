import type { NursingQuestion } from "./types";

export function shuffle<T>(values: T[]): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function normalizeQuestions(questions: NursingQuestion[], shuffleQuestions = true, shuffleOptions = true) {
  const normalized = questions.map((q) => {
    if (!shuffleOptions || !["multiple", "sata", "case_study", "priority", "true_false"].includes(q.type)) return { ...q };
    return { ...q, options: shuffle(q.options) };
  });
  return shuffleQuestions ? shuffle(normalized) : normalized;
}
