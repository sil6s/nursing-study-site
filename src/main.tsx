import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import App from "./App";
import "./styles.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) throw new Error("Missing VITE_CONVEX_URL. Copy .env.example to .env.local.");
const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode><ConvexAuthProvider client={convex}><App /></ConvexAuthProvider></StrictMode>,
);
