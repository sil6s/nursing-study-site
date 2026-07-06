import { useAction, useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, FileText, Settings, Target } from "lucide-react";
import { HomeScreen } from "./components/HomeScreen";
import { GenerateQuizModal } from "./components/GenerateQuizModal";
import { QuizScreen } from "./components/QuizScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { ExplanationDrawer } from "./components/ExplanationDrawer";
import { AuthScreen } from "./components/AuthScreen";
import { AppNavigation } from "./components/AppNavigation";
import { QuizLibrary } from "./components/QuizLibrary";
import { MissedQuestions } from "./components/MissedQuestions";
import { WeakTopics } from "./components/WeakTopics";
import { isCorrect, scoreQuiz } from "./lib/quizScoring";
import { normalizeQuestions } from "./lib/normalizeQuestions";
import type { AnswerValue, NursingQuestion } from "./lib/types";

type Screen = "home" | "quiz" | "results" | "review";

export default function App() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const userId = user?._id;
  const [screen, setScreen] = useState<Screen>("home");
  const [view, setView] = useState("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialTopic, setInitialTopic] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeQuizId, setActiveQuizId] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [explanationIndex, setExplanationIndex] = useState(0);
  const [explanationLoading, setExplanationLoading] = useState(false);

  const quizzes = useQuery(api.quizzes.list, userId ? { userId } : "skip") ?? [];
  const attempts = useQuery(api.attempts.list, userId ? { userId } : "skip") ?? [];
  const materials = useQuery(api.materials.list, userId ? { userId } : "skip") ?? [];
  const topics = useQuery(api.topics.list, userId ? { userId } : "skip") ?? [];
  const missed = useQuery(api.missedQuestions.list, userId ? { userId } : "skip") ?? [];
  const weakTopics = useQuery(api.missedQuestions.weakTopics, userId ? { userId } : "skip") ?? [];
  const quizData = useQuery(api.quizzes.get, activeQuizId ? { quizId: activeQuizId } : "skip");
  const progress = useQuery(api.progress.get, userId && activeQuizId ? { userId, quizId: activeQuizId } : "skip");
  const currentQuestion = questions[explanationIndex];
  const thread = useQuery(api.explanations.get, userId && currentQuestion?._id ? { userId, questionId: currentQuestion._id } : "skip");

  const uploadUrl = useMutation(api.materials.generateUploadUrl);
  const createMaterial = useMutation(api.materials.create);
  const extractTopics = useAction(api.gemini.extractTopics);
  const generateQuiz = useAction(api.gemini.generateQuiz);
  const startAttempt = useMutation(api.attempts.start);
  const recordAnswer = useMutation(api.attempts.recordAnswer);
  const completeAttempt = useMutation(api.attempts.complete);
  const saveProgress = useMutation(api.progress.save);
  const recordMiss = useMutation(api.missedQuestions.record);
  const archiveQuiz = useMutation(api.quizzes.archive);
  const explain = useAction(api.gemini.explainQuestion);

  useEffect(() => {
    if (!quizData || screen !== "home") return;
    const qs = normalizeQuestions(quizData.questions as unknown as NursingQuestion[], quizData.quiz.shuffleQuestions, quizData.quiz.shuffleOptions);
    setQuestions(qs);
    if (progress) {
      const restored: Record<number, AnswerValue> = {};
      qs.forEach((q: any, i: number) => {
        const found = progress.answers.find((a: any) => a.questionId === q._id);
        if (found) restored[i] = found.answer;
      });
      setAnswers(restored);
      setSubmitted(new Set(qs.map((q: any, i: number) => progress.submittedQuestionIds.includes(q._id) ? i : -1).filter((i: number) => i >= 0)));
      setIndex(progress.currentIndex);
      setAttemptId(progress.attemptId);
    } else {
      setAnswers({}); setSubmitted(new Set()); setIndex(0);
    }
    setScreen("quiz");
  }, [quizData, progress]);

  const selectedTopicObjects = useMemo(() => topics.filter((t: any) => selectedTopics.includes(t._id)).map((t: any) => ({
    title: t.title, description: t.description, keyConcepts: t.keyConcepts, priority: t.priority, sourceReference: t.sourceReference,
  })), [topics, selectedTopics]);

  async function handleUpload(file: File) {
    if (!userId) return;
    setBusy(true); setError("");
    try {
      const url = await uploadUrl();
      const response = await fetch(url, { method: "POST", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      if (!response.ok) throw new Error("File upload failed.");
      const { storageId } = await response.json();
      await createMaterial({ userId, fileName: file.name, mimeType: file.type || "application/octet-stream", size: file.size, storageId });
    } catch (e) { setError(message(e)); } finally { setBusy(false); }
  }

  async function handleExtract(materialId: any) {
    if (!userId) return;
    setBusy(true); setError("");
    try { await extractTopics({ userId, materialId }); }
    catch (e) { setError(message(e)); } finally { setBusy(false); }
  }

  async function handleGenerate(config: any) {
    if (!userId) return;
    setBusy(true); setError("");
    try {
      const quizId = await generateQuiz({ userId, ...config, topics: selectedTopicObjects, shuffleQuestions: true, shuffleOptions: true });
      setModalOpen(false); setActiveQuizId(quizId);
    } catch (e) { setError(message(e)); } finally { setBusy(false); }
  }

  async function openQuiz(quizId: any) {
    setActiveQuizId(null);
    queueMicrotask(() => setActiveQuizId(quizId));
  }

  async function submitCurrent() {
    if (!userId || !activeQuizId || answers[index] === undefined) return;
    let id = attemptId;
    if (!id) {
      id = await startAttempt({ userId, quizId: activeQuizId, mode: quizData!.quiz.mode, totalQuestions: questions.length });
      setAttemptId(id);
    }
    const q = questions[index];
    const correct = isCorrect(q, answers[index]);
    await Promise.all([
      recordAnswer({ attemptId: id, userId, quizId: activeQuizId, questionId: q._id, answer: answers[index], isCorrect: correct }),
      recordMiss({ userId, questionId: q._id, quizId: activeQuizId, topic: q.topic, subtopic: q.subtopic, isCorrect: correct }),
    ]);
    const nextSubmitted = new Set(submitted).add(index);
    setSubmitted(nextSubmitted);
    await persist(id, index, answers, nextSubmitted);
  }

  async function persist(id: any, current: number, values = answers, done = submitted) {
    if (!userId || !activeQuizId || !id) return;
    await saveProgress({
      userId, quizId: activeQuizId, attemptId: id, currentIndex: current,
      answers: Object.entries(values).map(([i, answer]) => ({ questionId: questions[Number(i)]._id, answer })),
      submittedQuestionIds: [...done].map(i => questions[i]._id),
    });
  }

  async function nextQuestion() {
    if (index < questions.length - 1) { const next = index + 1; setIndex(next); await persist(attemptId, next); return; }
    const final = scoreQuiz(questions, answers);
    if (attemptId) await completeAttempt({ attemptId, score: final.score, correctCount: final.correctCount });
    setResult(final); setScreen("results");
  }

  async function askExplanation(request: string) {
    if (!userId || !currentQuestion) return;
    setExplanationLoading(true);
    try {
      await explain({ userId, questionId: currentQuestion._id, question: currentQuestion.question, options: currentQuestion.options, correctAnswer: currentQuestion.correctAnswer, rationale: currentQuestion.rationale, userAnswer: answers[explanationIndex], request });
    } catch (e) { setError(message(e)); } finally { setExplanationLoading(false); }
  }

  const activeQuiz = quizData?.quiz;
  if (authLoading) return <div className="loading-page">Opening your study workspace…</div>;
  if (!isAuthenticated) return <AuthScreen />;

  const viewContent = view === "home"
    ? <HomeScreen quizzes={quizzes} attempts={attempts} missed={missed} weakTopics={weakTopics} user={user} onGenerate={(topic?: string) => { setInitialTopic(typeof topic === "string" ? topic : ""); setModalOpen(true); }} onStart={openQuiz} onArchive={(quizId: any) => archiveQuiz({ quizId, archived: true })} />
    : view === "library" ? <main className="page view-page"><ViewTitle icon={<BookOpen />} eyebrow="Study collection" title="Quiz library" text="All of your generated and saved nursing quiz banks." /><QuizLibrary quizzes={quizzes} onStart={openQuiz} onArchive={(quizId: any) => archiveQuiz({ quizId, archived: true })} onCreate={() => setModalOpen(true)} /></main>
    : view === "progress" ? <main className="page view-page"><ViewTitle icon={<BarChart3 />} eyebrow="Performance" title="Your progress" text="Track scores, attempts, and the topics that need another pass." /><div className="dashboard-grid"><WeakTopics topics={weakTopics} onPractice={(topic: string) => { setInitialTopic(topic); setModalOpen(true); }} /><section className="panel"><h2>Recent attempts</h2>{attempts.slice(0, 8).map((a: any) => <div className="list-row" key={a._id}><div><strong>{a.status === "completed" ? `${a.score}% score` : "In progress"}</strong><span>{a.totalQuestions} questions</span></div></div>)}</section></div></main>
    : view === "missed" ? <main className="page view-page"><ViewTitle icon={<Target />} eyebrow="Focused review" title="Missed questions" text="Repeated misses are grouped into the areas where practice will matter most." /><div className="dashboard-grid"><MissedQuestions items={missed} onPractice={() => setModalOpen(true)} /><WeakTopics topics={weakTopics} onPractice={(topic: string) => { setInitialTopic(topic); setModalOpen(true); }} /></div></main>
    : view === "materials" ? <main className="page view-page"><ViewTitle icon={<FileText />} eyebrow="Source library" title="Study materials" text="Upload lectures, readings, slides, and images for AI topic extraction." /><button className="button primary" onClick={() => setModalOpen(true)}>Upload new material</button><div className="material-library">{materials.map((m: any) => <div className="material-library-card" key={m._id}><FileText /><div><strong>{m.fileName}</strong><span>{m.status} · {Math.round(m.size / 1024)} KB</span></div></div>)}</div></main>
    : <main className="page view-page"><ViewTitle icon={<Settings />} eyebrow="Account" title="Settings" text="Manage your NursePrep profile and study preferences." /><section className="panel settings-panel"><h2>Profile</h2><p><strong>{user?.name || "Nursing student"}</strong><br />{user?.email}</p><p className="muted">Your quizzes and progress are secured to this authenticated account.</p></section></main>;

  return <div className="app-shell app-authenticated">
    <AppNavigation view={view} onView={(next: string) => { setView(next); setScreen("home"); }} user={user} mobileOpen={mobileNav} setMobileOpen={setMobileNav} />
    <div className="app-workspace">
    {error && <div className="global-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
    {!userId ? <div className="loading-page">Loading your account…</div> :
      screen === "home" ? viewContent :
      screen === "quiz" && activeQuiz ? <QuizScreen quiz={activeQuiz} questions={questions} index={index} answer={answers[index]} submitted={submitted.has(index)} mode={activeQuiz.mode} onAnswer={(answer: AnswerValue) => setAnswers(old => ({ ...old, [index]: answer }))} onSubmit={submitCurrent} onNext={nextQuestion} onPrevious={() => setIndex(Math.max(0, index - 1))} onExit={() => { void persist(attemptId, index); setScreen("home"); setActiveQuizId(null); }} onExplain={() => { setExplanationIndex(index); setDrawerOpen(true); }} /> :
      screen === "results" ? <ResultsScreen result={result} onHome={() => { setScreen("home"); setActiveQuizId(null); }} onRetry={() => { const wrong = questions.filter((q, i) => !isCorrect(q, answers[i])); setQuestions(wrong); setAnswers({}); setSubmitted(new Set()); setIndex(0); setAttemptId(null); setScreen("quiz"); }} onReview={() => setScreen("review")} /> :
      <ReviewScreen questions={questions} answers={answers} onBack={() => setScreen("results")} onExplain={(i: number) => { setExplanationIndex(i); setDrawerOpen(true); }} />}
    <GenerateQuizModal key={initialTopic + String(modalOpen)} open={modalOpen} onClose={() => setModalOpen(false)} materials={materials} topics={topics} selectedTopics={selectedTopics} setSelectedTopics={setSelectedTopics} onUpload={handleUpload} onExtract={handleExtract} onGenerate={handleGenerate} busy={busy} initialTopic={initialTopic} />
    <ExplanationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} thread={thread} onAsk={askExplanation} loading={explanationLoading} />
    </div>
  </div>;
}

function message(error: unknown) { return error instanceof Error ? error.message.replace(/^Uncaught Error:\s*/, "") : "Something went wrong."; }

function ViewTitle({ icon, eyebrow, title, text }: { icon: ReactNode; eyebrow: string; title: string; text: string }) {
  return <div className="view-title"><span>{icon}</span><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div></div>;
}
