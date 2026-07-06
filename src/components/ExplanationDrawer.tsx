import { Brain, LoaderCircle, Send, X } from "lucide-react";
import { useState } from "react";

const prompts = ["Explain this more", "Why is my answer wrong?", "Explain like I’m new to nursing", "Give me a memory trick", "Make a simpler version", "Generate another similar question"];

export function ExplanationDrawer({ open, onClose, thread, onAsk, loading }: any) {
  const [message, setMessage] = useState("");
  if (!open) return null;
  const submit = (text = message) => { if (text.trim()) { onAsk(text); setMessage(""); } };
  return <aside className="drawer"><div className="drawer-heading"><div><Brain size={20} /><strong>AI nursing tutor</strong></div><button className="icon-button" onClick={onClose}><X /></button></div>
    <div className="quick-prompts">{prompts.map(p => <button key={p} onClick={() => submit(p)}>{p}</button>)}</div>
    <div className="messages">{thread?.messages?.map((m: any, i: number) => <div key={i} className={`message ${m.role}`}>{m.content}</div>)}{loading && <div className="message assistant"><LoaderCircle className="spin" /></div>}</div>
    <div className="composer"><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask a follow-up…" /><button className="button primary" onClick={() => submit()}><Send size={16} /></button></div>
  </aside>;
}
