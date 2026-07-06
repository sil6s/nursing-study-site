import { ArrowLeft, Brain, CheckCircle2, XCircle } from "lucide-react";
import { isCorrect } from "../lib/quizScoring";

export function ReviewScreen({ questions, answers, onBack, onExplain }: any) {
  return <main className="page narrow"><div className="section-heading"><div><span className="eyebrow">Answer review</span><h1>Rationales and corrections</h1></div><button className="button secondary" onClick={onBack}><ArrowLeft size={16} /> Results</button></div>
    <div className="review-list">{questions.map((q: any, i: number) => { const correct = isCorrect(q, answers[i]); return <article className={`review-card ${correct ? "right" : "wrong"}`} key={q._id}>
      <div className="review-status">{correct ? <CheckCircle2 /> : <XCircle />} Question {i + 1}</div><h3>{q.question}</h3><p><strong>Your answer:</strong> {Array.isArray(answers[i]) ? answers[i].join(", ") : String(answers[i] ?? "Not answered")}</p><p><strong>Correct answer:</strong> {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : String(q.correctAnswer)}</p><div className="feedback"><p>{q.rationale}</p></div><button className="button secondary" onClick={() => onExplain(i)}><Brain size={16} /> Ask AI about this</button>
    </article>; })}</div>
  </main>;
}
