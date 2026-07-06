import { ArrowRight, BookOpen, Brain, FilePlus2, FileUp, Lightbulb, Sparkles, Stethoscope, Target, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { QuizLibrary } from "./QuizLibrary";
import { MissedQuestions } from "./MissedQuestions";
import { WeakTopics } from "./WeakTopics";

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>;
}

export function HomeScreen({ quizzes, attempts, missed, weakTopics, onGenerate, onStart, onArchive, user }: any) {
  const [idea, setIdea] = useState("");
  const completed = attempts.filter((a: any) => a.status === "completed");
  const average = completed.length ? Math.round(completed.reduce((sum: number, a: any) => sum + a.score, 0) / completed.length) : 0;
  return <main className="page">
    <section className="workspace-hero">
      <div className="ai-orb"><Sparkles /></div>
      <span className="eyebrow">Your AI nursing study partner</span>
      <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "student"}.</h1>
      <p>What do you want to <em>master today?</em></p>
      <div className="start-options">
        <div className="start-option topic-option">
          <div className="start-option-heading"><span><Brain /></span><div><small>Option 1</small><h2>Start from a topic</h2></div></div>
          <p>Enter anything you need to study and NursePrep will build a focused quiz.</p>
          <div className="quiz-launcher-row">
            <input id="home-topic" value={idea} onChange={e => setIdea(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && idea.trim()) onGenerate(idea); }}
              placeholder="e.g. Heart failure or insulin administration" />
            <button className="button primary" disabled={!idea.trim()} onClick={() => onGenerate(idea)}>Continue <ArrowRight /></button>
          </div>
        </div>
        <button className="start-option material-option" onClick={() => onGenerate()}>
          <div className="start-option-heading"><span><FileUp /></span><div><small>Option 2</small><h2>Upload class materials</h2></div></div>
          <p>Use your lecture slides, study guides, PDFs, notes, documents, or images.</p>
          <div className="material-cta">Choose files <ArrowRight /></div>
        </button>
      </div>
      <div className="start-helper">
        <span>Both options open the quiz builder</span>
        <span>•</span>
        <span>AI-generated, NCLEX-ready questions</span>
      </div>
      <div className="starter-label">Try a quick start</div>
      <div className="starter-grid">
        <button onClick={() => onGenerate("Create a priority nursing quiz")}><Stethoscope /><span><strong>Priority practice</strong>Build clinical judgment</span></button>
        <button onClick={() => onGenerate("Medication calculations")}><Brain /><span><strong>Medication math</strong>Practice safe calculations</span></button>
        <button onClick={() => onGenerate("Create a mini study guide")}><Lightbulb /><span><strong>Study guide</strong>Review a difficult topic</span></button>
        <button onClick={() => onGenerate()}><FilePlus2 /><span><strong>Upload lecture</strong>Extract key concepts</span></button>
      </div>
    </section>
    <section className="stats-grid">
      <Stat icon={<BookOpen />} label="Saved quizzes" value={quizzes.length} />
      <Stat icon={<TrendingUp />} label="Average score" value={`${average}%`} />
      <Stat icon={<Target />} label="Questions to revisit" value={missed.length} />
    </section>
    <QuizLibrary quizzes={quizzes} onStart={onStart} onArchive={onArchive} onCreate={onGenerate} />
    <div className="dashboard-grid">
      <MissedQuestions items={missed} onPractice={() => onGenerate("missed")} />
      <WeakTopics topics={weakTopics} onPractice={(topic: string) => onGenerate(topic)} />
    </div>
  </main>;
}
