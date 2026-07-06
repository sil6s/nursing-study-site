import { Archive, BookOpen, Plus, Play } from "lucide-react";

export function QuizLibrary({ quizzes, onStart, onArchive, onCreate }: any) {
  return <section className="section">
    <div className="section-heading"><div><span className="eyebrow">Your library</span><h2>Saved quiz banks</h2></div><button className="button secondary" onClick={onCreate}><Plus size={16} /> New quiz</button></div>
    {!quizzes.length ? <div className="empty-state"><BookOpen size={32} /><h3>No quizzes yet</h3><p>Create one from a topic, notes, or class materials.</p><button className="button primary" onClick={onCreate}>Create your first quiz</button></div> :
      <div className="quiz-grid">{quizzes.map((quiz: any) => <article className="quiz-card" key={quiz._id}>
        <div className="quiz-card-top"><span className="badge">{quiz.difficulty}</span><button className="icon-button" title="Archive quiz" onClick={() => onArchive(quiz._id)}><Archive size={16} /></button></div>
        <h3>{quiz.title}</h3><p>{quiz.description || "Nursing practice quiz"}</p>
        <div className="quiz-meta"><span>{quiz.questionCount} questions</span><span>{quiz.mode === "test" ? "Test mode" : "Immediate feedback"}</span></div>
        <button className="button primary full" onClick={() => onStart(quiz._id)}><Play size={16} /> Start or resume</button>
      </article>)}</div>}
  </section>;
}
