/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attempts from "../attempts.js";
import type * as auth from "../auth.js";
import type * as authUtils from "../authUtils.js";
import type * as explanations from "../explanations.js";
import type * as gemini from "../gemini.js";
import type * as http from "../http.js";
import type * as materials from "../materials.js";
import type * as missedQuestions from "../missedQuestions.js";
import type * as progress from "../progress.js";
import type * as questions from "../questions.js";
import type * as quizzes from "../quizzes.js";
import type * as topics from "../topics.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  attempts: typeof attempts;
  auth: typeof auth;
  authUtils: typeof authUtils;
  explanations: typeof explanations;
  gemini: typeof gemini;
  http: typeof http;
  materials: typeof materials;
  missedQuestions: typeof missedQuestions;
  progress: typeof progress;
  questions: typeof questions;
  quizzes: typeof quizzes;
  topics: typeof topics;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
