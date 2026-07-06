import { BookMarked, LoaderCircle, X } from "lucide-react";
export function StudyGuidePanel({ open, guide, loading, onClose }: any) {
  if (!open) return null;
  return <aside className="drawer"><div className="drawer-heading"><div><BookMarked /><strong>Mini study guide</strong></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="study-guide">{loading ? <LoaderCircle className="spin" /> : guide}</div></aside>;
}
