import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const answer = v.union(v.string(), v.array(v.string()), v.number(), v.record(v.string(), v.string()));
const questionType = v.union(v.literal("multiple"), v.literal("sata"), v.literal("order"), v.literal("true_false"), v.literal("fill_blank"), v.literal("case_study"), v.literal("priority"), v.literal("med_calc"), v.literal("matching"));
const difficulty = v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("nclex"));

export default defineSchema({
  ...authTables,

  uploadedMaterials: defineTable({
    userId: v.id("users"), fileName: v.string(), mimeType: v.string(), size: v.number(),
    storageId: v.id("_storage"), status: v.union(v.literal("uploaded"), v.literal("processing"), v.literal("ready"), v.literal("failed")),
    extractedText: v.optional(v.string()), error: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_created", ["userId", "createdAt"]),

  extractedStudyTopics: defineTable({
    userId: v.id("users"), materialId: v.optional(v.id("uploadedMaterials")), title: v.string(),
    description: v.string(), keyConcepts: v.array(v.string()), priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    sourceReference: v.optional(v.string()), selected: v.boolean(), createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_material", ["materialId"]),

  quizzes: defineTable({
    userId: v.id("users"), title: v.string(), description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    questionCount: v.number(), difficulty: v.union(difficulty, v.literal("mixed")),
    sourceType: v.union(v.literal("topic"), v.literal("notes"), v.literal("material"), v.literal("mixed")),
    mode: v.union(v.literal("immediate"), v.literal("test")), shuffleQuestions: v.boolean(), shuffleOptions: v.boolean(),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_status", ["userId", "status"]),

  quizQuestions: defineTable({
    quizId: v.id("quizzes"), order: v.number(), type: questionType, topic: v.string(), subtopic: v.string(),
    difficulty, nclexCategory: v.optional(v.string()), question: v.string(), options: v.array(v.string()),
    correctAnswer: answer, rationale: v.string(), wrongAnswerRationales: v.record(v.string(), v.string()),
    tags: v.array(v.string()), sourceReference: v.optional(v.string()), createdAt: v.number(), updatedAt: v.number(),
  }).index("by_quiz", ["quizId"]).index("by_quiz_order", ["quizId", "order"]),

  quizAttempts: defineTable({
    userId: v.id("users"), quizId: v.id("quizzes"),
    status: v.union(v.literal("in_progress"), v.literal("completed"), v.literal("abandoned")),
    mode: v.union(v.literal("immediate"), v.literal("test")), score: v.number(), correctCount: v.number(),
    totalQuestions: v.number(), startedAt: v.number(), completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_quiz", ["quizId"]).index("by_user_status", ["userId", "status"]),

  quizAnswers: defineTable({
    attemptId: v.id("quizAttempts"), userId: v.id("users"), quizId: v.id("quizzes"), questionId: v.id("quizQuestions"),
    answer, isCorrect: v.boolean(), answeredAt: v.number(),
  }).index("by_attempt", ["attemptId"]).index("by_user_question", ["userId", "questionId"]),

  quizProgress: defineTable({
    userId: v.id("users"), quizId: v.id("quizzes"), attemptId: v.id("quizAttempts"), currentIndex: v.number(),
    answers: v.array(v.object({ questionId: v.id("quizQuestions"), answer })),
    submittedQuestionIds: v.array(v.id("quizQuestions")), updatedAt: v.number(),
  }).index("by_user_quiz", ["userId", "quizId"]).index("by_attempt", ["attemptId"]),

  missedQuestions: defineTable({
    userId: v.id("users"), questionId: v.id("quizQuestions"), quizId: v.id("quizzes"),
    topic: v.string(), subtopic: v.string(), timesMissed: v.number(), timesCorrectAfterMiss: v.number(),
    lastMissedAt: v.number(), resolvedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_user_question", ["userId", "questionId"]),

  aiExplanationThreads: defineTable({
    userId: v.id("users"), questionId: v.id("quizQuestions"), title: v.string(),
    messages: v.array(v.object({ role: v.union(v.literal("user"), v.literal("assistant")), content: v.string(), createdAt: v.number() })),
    createdAt: v.number(), updatedAt: v.number(),
  }).index("by_user_question", ["userId", "questionId"]),
});
