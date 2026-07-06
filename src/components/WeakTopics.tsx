import { Activity } from "lucide-react";
export function WeakTopics({ topics, onPractice }: any) {
  return <section className="panel"><div className="panel-heading"><h2>Weak topic areas</h2></div>
    {!topics.length ? <div className="mini-empty"><Activity /><p>Topic trends appear after completed quizzes.</p></div> : topics.map((x: any) => <button className="weak-topic" key={x.topic} onClick={() => onPractice(x.topic)}><span>{x.topic}</span><strong>{x.misses} misses</strong></button>)}
  </section>;
}
