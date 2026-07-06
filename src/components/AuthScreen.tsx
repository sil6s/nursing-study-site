import { useAuthActions } from "@convex-dev/auth/react";
import { BookOpenCheck, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    data.set("flow", flow);
    try {
      await signIn("password", data);
    } catch {
      setError(flow === "signIn" ? "Email or password is incorrect." : "Could not create the account. Try another email.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-story">
      <div className="brand brand-static"><span><BookOpenCheck /></span><div>NursePrep<small>AI Study Lab</small></div></div>
      <div className="auth-copy"><span className="eyebrow"><Sparkles size={14} /> Built for nursing school</span>
        <h1>Study smarter.<br /><em>Think clinically.</em></h1>
        <p>Turn lectures, notes, and class materials into focused practice that follows you across every device.</p>
        <div className="auth-points"><span><ShieldCheck /> Private study workspace</span><span><BookOpenCheck /> Saved quizzes and progress</span></div>
      </div>
    </section>
    <section className="auth-form-side"><form className="auth-card" onSubmit={submit}>
      <div className="auth-mark"><Sparkles /></div>
      <h2>{flow === "signIn" ? "Welcome back" : "Create your account"}</h2>
      <p>{flow === "signIn" ? "Sign in to continue your study plan." : "Start building your personal nursing study library."}</p>
      {flow === "signUp" && <label>Name<input name="name" autoComplete="name" required placeholder="Your name" /></label>}
      <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input name="password" type="password" autoComplete={flow === "signIn" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters" /></label>
      {error && <div className="auth-error">{error}</div>}
      <button className="button primary full auth-submit" disabled={busy}>{busy && <LoaderCircle className="spin" size={17} />}{flow === "signIn" ? "Sign in" : "Create account"}</button>
      <div className="auth-switch">{flow === "signIn" ? "New to NursePrep?" : "Already have an account?"}<button type="button" onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}>{flow === "signIn" ? "Create account" : "Sign in"}</button></div>
    </form></section>
  </main>;
}
