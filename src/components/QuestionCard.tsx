import type { AnswerValue, NursingQuestion } from "../lib/types";

export function QuestionCard({ question, answer, onAnswer, submitted, showFeedback }: { question: NursingQuestion; answer?: AnswerValue; onAnswer: (answer: AnswerValue) => void; submitted: boolean; showFeedback: boolean }) {
  const multi = question.type === "sata";
  const selected = Array.isArray(answer) ? answer : answer === undefined ? [] : [String(answer)];
  if (question.type === "order") {
    const ordered = Array.isArray(answer) ? answer : Array(question.options.length).fill("");
    return <div className="question-card"><QuestionHeader q={question} />{ordered.map((value, i) => <label className="order-row" key={i}><strong>{i + 1}</strong><select disabled={submitted} value={value} onChange={e => { const next = [...ordered]; next[i] = e.target.value; onAnswer(next); }}><option value="">Choose item…</option>{question.options.map(o => <option key={o}>{o}</option>)}</select></label>)}{showFeedback && <Feedback q={question} />}</div>;
  }
  if (question.type === "fill_blank" || question.type === "med_calc") {
    return <div className="question-card"><QuestionHeader q={question} /><input className="answer-input" disabled={submitted} value={typeof answer === "string" || typeof answer === "number" ? answer : ""} onChange={e => onAnswer(e.target.value)} placeholder="Type your answer…" />{showFeedback && <Feedback q={question} />}</div>;
  }
  return <div className="question-card"><QuestionHeader q={question} /><div className="options">{question.options.map((option, index) => {
    const active = selected.includes(option);
    const correct = submitted && (Array.isArray(question.correctAnswer) ? question.correctAnswer.includes(option) : question.correctAnswer === option);
    return <button disabled={submitted} key={option} className={`option ${active ? "selected" : ""} ${correct ? "correct" : ""}`} onClick={() => onAnswer(multi ? (active ? selected.filter(x => x !== option) : [...selected, option]) : option)}>
      <span>{String.fromCharCode(65 + index)}</span><p>{option}</p>
    </button>;
  })}</div>{showFeedback && <Feedback q={question} />}</div>;
}

function QuestionHeader({ q }: { q: NursingQuestion }) {
  return <><div className="question-tags"><span className="badge">{q.type.replace("_", " ")}</span><span>{q.topic} · {q.difficulty}</span></div><h2 className="question-text">{q.question}</h2>{q.type === "sata" && <p className="instruction">Select all that apply.</p>}</>;
}
function Feedback({ q }: { q: NursingQuestion }) {
  return <div className="feedback"><strong>Correct answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : String(q.correctAnswer)}</strong><p>{q.rationale}</p></div>;
}
