import { BarChart3, BookOpen, Brain, ChevronLeft, FileText, Home, LogOut, Menu, Settings, Sparkles, Target, X } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";

const items = [
  ["home", "Overview", Home],
  ["generate", "Create quiz", Sparkles],
  ["library", "Quiz library", BookOpen],
  ["progress", "Progress", BarChart3],
  ["missed", "Missed questions", Target],
  ["materials", "Materials", FileText],
] as const;

export function AppNavigation({ view, onView, user, mobileOpen, setMobileOpen }: any) {
  const { signOut } = useAuthActions();
  return <>
    <button className="mobile-nav-button" onClick={() => setMobileOpen(true)}><Menu /></button>
    {mobileOpen && <div className="nav-scrim" onClick={() => setMobileOpen(false)} />}
    <aside className={`app-nav ${mobileOpen ? "open" : ""}`}>
      <div className="nav-brand"><span><Brain /></span><strong>NursePrep<small>Study Lab</small></strong><button onClick={() => setMobileOpen(false)}><X /></button></div>
      <nav>{items.map(([id, label, Icon]) => <button key={id} className={view === id ? "active" : ""} onClick={() => { onView(id); setMobileOpen(false); }}><Icon /><span>{label}</span>{id === "generate" && <b>AI</b>}</button>)}</nav>
      <div className="nav-bottom"><button onClick={() => onView("settings")} className={view === "settings" ? "active" : ""}><Settings /><span>Settings</span></button>
        <div className="nav-profile"><div className="avatar">{(user?.name || user?.email || "N")[0].toUpperCase()}</div><div><strong>{user?.name || "Nursing student"}</strong><span>{user?.email}</span></div><button title="Sign out" onClick={() => void signOut()}><LogOut /></button></div>
      </div>
    </aside>
  </>;
}
