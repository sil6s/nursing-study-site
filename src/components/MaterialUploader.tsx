import { FileText, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { ACCEPTED_MATERIALS, validateMaterialFile } from "../lib/fileTextExtraction";

export function MaterialUploader({ materials, onUpload, onExtract, busy }: any) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const choose = async (file?: File) => {
    if (!file) return;
    try { validateMaterialFile(file); await onUpload(file); } catch (e) { alert(e instanceof Error ? e.message : "Upload failed."); }
  };
  return <div>
    <div className={`drop-zone ${drag ? "dragging" : ""}`} onClick={() => input.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); void choose(e.dataTransfer.files[0]); }}>
      <UploadCloud size={30} /><h3>Drop class materials here</h3>
      <p>PDF, PowerPoint, Word, text, Markdown, or images · max 20 MB</p>
      <input ref={input} hidden type="file" accept={ACCEPTED_MATERIALS} onChange={e => void choose(e.target.files?.[0])} />
    </div>
    {!!materials.length && <div className="material-list">{materials.map((m: any) => <div className="material-row" key={m._id}>
      <FileText size={20} /><div><strong>{m.fileName}</strong><span>{Math.round(m.size / 1024)} KB · {m.status}</span></div>
      <button className="button secondary small" disabled={busy || m.status === "processing"} onClick={() => onExtract(m._id)}>
        {m.status === "processing" ? <LoaderCircle className="spin" size={15} /> : null} Extract topics
      </button>
      {m.error && <span className="error-text" title={m.error}><X size={16} /></span>}
    </div>)}</div>}
  </div>;
}
