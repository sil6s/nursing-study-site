import { Brain, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { QuestionCard } from "./QuestionCard";

export function QuizScreen({ quiz, questions, index, answer, submitted, mode, onAnswer, onSubmit, onNext, onPrevious, onExit, onExplain }: any) {
  const question = questions[index];
  const answered = answer !== undefined && (!Array.isArray(answer) || answer.filter(Boolean).length > 0);
  return <main className="quiz-page"><div className="quiz-topbar"><div><strong>{quiz.title}</strong><span>Question {index + 1} of {questions.length}</span></div><button className="button secondary" onClick={onExit}><LogOut size={16} /> Exit</button></div>
    <div className="progress"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
    <QuestionCard question={question} answer={answer} onAnswer={onAnswer} submitted={submitted} showFeedback={submitted && mode === "immediate"} />
    <div className="quiz-actions"><button className="button secondary" disabled={!index} onClick={onPrevious}><ChevronLeft size={17} /> Previous</button>
      <div>{submitted && <button className="button secondary" onClick={onExplain}><Brain size={17} /> Explain this more</button>}
      {!submitted ? <button className="button primary" disabled={!answered} onClick={onSubmit}>Submit answer</button> : <button className="button primary" onClick={onNext}>{index === questions.length - 1 ? "Finish quiz" : "Next"} <ChevronRight size={17} /></button>}</div></div>
  </main>;
}
