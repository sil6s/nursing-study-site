import { LoaderCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { MaterialUploader } from "./MaterialUploader";
import { TopicExtractor } from "./TopicExtractor";

export function GenerateQuizModal({ open, onClose, materials, topics, selectedTopics, setSelectedTopics, onUpload, onExtract, onGenerate, busy, initialTopic = "" }: any) {
  const [title, setTitle] = useState("My Nursing Quiz");
  const [topicPrompt, setTopicPrompt] = useState(initialTopic);
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(15);
  const [difficulty, setDifficulty] = useState("mixed");
  const [mode, setMode] = useState("immediate");
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-shell">
      <div className="modal-heading"><div><span className="eyebrow"><Sparkles size={14} /> AI quiz builder</span><h2>Create a nursing quiz</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
      <div className="form-section"><h3>1. Add your source material</h3><MaterialUploader materials={materials} onUpload={onUpload} onExtract={onExtract} busy={busy} /></div>
      <div className="form-section"><h3>2. Choose extracted topics</h3><TopicExtractor topics={topics} selected={selectedTopics} onToggle={(id: string) => setSelectedTopics((old: string[]) => old.includes(id) ? old.filter(x => x !== id) : [...old, id])} /></div>
      <div className="form-section"><h3>3. Configure the quiz</h3>
        <div className="field-grid"><label>Quiz title<input value={title} onChange={e => setTitle(e.target.value)} /></label><label>Topic or study idea<input value={topicPrompt} onChange={e => setTopicPrompt(e.target.value)} placeholder="Cardiac pharmacology..." /></label></div>
        <label>Paste notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Lecture notes, objectives, study guide content..." /></label>
        <div className="field-grid three"><label>Questions<input type="number" min={5} max={100} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
          <label>Difficulty<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="mixed">Mixed</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="nclex">NCLEX</option></select></label>
          <label>Quiz mode<select value={mode} onChange={e => setMode(e.target.value)}><option value="immediate">Immediate feedback</option><option value="test">Test mode</option></select></label></div>
      </div>
      <div className="modal-footer"><button className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={busy} onClick={() => onGenerate({ title, topicPrompt, notes, count, difficulty, mode })}>{busy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />} Generate quiz</button></div>
    </div>
  </div>;
}
