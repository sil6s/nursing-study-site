import { AlertCircle } from "lucide-react";
export function MissedQuestions({ items, onPractice }: any) {
  return <section className="panel"><div className="panel-heading"><h2>Missed questions</h2>{items.length > 0 && <button className="text-button" onClick={onPractice}>Practice</button>}</div>
    {!items.length ? <div className="mini-empty"><AlertCircle /><p>Missed questions will collect here.</p></div> : items.slice(0, 5).map((x: any) => <div className="list-row" key={x._id}><div><strong>{x.topic}</strong><span>{x.subtopic}</span></div><span className="count-badge">{x.timesMissed}×</span></div>)}
  </section>;
}
