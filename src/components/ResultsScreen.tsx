import { BookOpen, Home, RotateCcw, Target } from "lucide-react";

export function ResultsScreen({ result, onHome, onRetry, onReview }: any) {
  return <main className="page narrow"><section className="results-card"><div className="score-circle"><strong>{result.score}%</strong><span>score</span></div><h1>{result.score >= 80 ? "Strong work." : "Keep building your clinical judgment."}</h1><p>You answered {result.correctCount} of {result.total} questions correctly.</p>
    <div className="results-actions"><button className="button secondary" onClick={onRetry}><RotateCcw size={17} /> Retry missed</button><button className="button secondary" onClick={onReview}><BookOpen size={17} /> Review answers</button><button className="button primary" onClick={onHome}><Home size={17} /> Dashboard</button></div></section>
    <div className="callout"><Target /><div><strong>Next best step</strong><p>Review the rationales, then practice your highest-miss topic from the dashboard.</p></div></div>
  </main>;
}
