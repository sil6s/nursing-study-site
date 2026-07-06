import { Check, Layers } from "lucide-react";

export function TopicExtractor({ topics, selected, onToggle }: any) {
  if (!topics.length) return <div className="topic-placeholder"><Layers size={26} /><p>Extracted study topics will appear here before quiz generation.</p></div>;
  return <div className="topic-grid">{topics.map((topic: any) => {
    const active = selected.includes(topic._id);
    return <button type="button" className={`topic-card ${active ? "selected" : ""}`} key={topic._id} onClick={() => onToggle(topic._id)}>
      <span className={`priority ${topic.priority}`}>{topic.priority}</span>{active && <Check size={16} />}
      <strong>{topic.title}</strong><p>{topic.description}</p>
      <small>{topic.keyConcepts.slice(0, 3).join(" · ")}</small>
    </button>;
  })}</div>;
}
