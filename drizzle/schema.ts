import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

// Core user table (existing)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// QuerySession - represents a complete reasoning session
export const querySessions = mysqlTable("query_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  userQuery: text("user_query").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "error"]).default("in_progress").notNull(),
  finalAnswer: text("final_answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// ChamberState - represents one chamber's processing
export const chamberStates = mysqlTable("chamber_states", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  chamberName: varchar("chamber_name", { length: 64 }).notNull(), // Surface, Descent, Compression, Expansion, Return
  inputText: text("input_text").notNull(),
  outputText: text("output_text"),
  llmTrace: text("llm_trace"), // raw LLM reasoning if available
  enteredAt: timestamp("entered_at").defaultNow().notNull(),
  exitedAt: timestamp("exited_at"),
  recursionDepth: int("recursion_depth").default(0).notNull(),
  parentChamberName: varchar("parent_chamber_name", { length: 64 }), // for traceability
});

// ChamberMetrics - metrics for each chamber
export const chamberMetrics = mysqlTable("chamber_metrics", {
  id: int("id").autoincrement().primaryKey(),
  chamberStateId: int("chamber_state_id").notNull(),
  coherenceScore: decimal("coherence_score", { precision: 3, scale: 2 }).notNull(), // 0-1
  driftScore: decimal("drift_score", { precision: 3, scale: 2 }).notNull(), // 0-1
  symbolicDensity: decimal("symbolic_density", { precision: 3, scale: 2 }).notNull(), // 0-1
  ambiguityScore: decimal("ambiguity_score", { precision: 3, scale: 2 }).notNull(), // 0-1
  correctionCount: int("correction_count").default(0).notNull(),
});

// WitnessState - aggregated metrics for the session
export const witnessStates = mysqlTable("witness_states", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  overallCoherence: decimal("overall_coherence", { precision: 3, scale: 2 }).notNull(),
  overallDrift: decimal("overall_drift", { precision: 3, scale: 2 }).notNull(),
  overallSymbolicDensity: decimal("overall_symbolic_density", { precision: 3, scale: 2 }).notNull(),
  alignmentScore: decimal("alignment_score", { precision: 3, scale: 2 }).notNull(),
  activeChamber: varchar("active_chamber", { length: 64 }).notNull(),
  recursionDepth: int("recursion_depth").default(0).notNull(),
  totalCorrections: int("total_corrections").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// CorrectionEvent - represents a correction that occurred
export const correctionEvents = mysqlTable("correction_events", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  chamberName: varchar("chamber_name", { length: 64 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(), // logical_inconsistency, user_feedback, witness_flag
  severity: mysqlEnum("severity", ["minor", "moderate", "major"]).notNull(),
  previousOutput: text("previous_output").notNull(),
  correctedOutput: text("corrected_output").notNull(),
  deltaSummary: text("delta_summary"), // short explanation of what changed
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type QuerySession = typeof querySessions.$inferSelect;
export type InsertQuerySession = typeof querySessions.$inferInsert;

export type ChamberState = typeof chamberStates.$inferSelect;
export type InsertChamberState = typeof chamberStates.$inferInsert;

export type ChamberMetrics = typeof chamberMetrics.$inferSelect;
export type InsertChamberMetrics = typeof chamberMetrics.$inferInsert;

export type WitnessState = typeof witnessStates.$inferSelect;
export type InsertWitnessState = typeof witnessStates.$inferInsert;

export type CorrectionEvent = typeof correctionEvents.$inferSelect;
export type InsertCorrectionEvent = typeof correctionEvents.$inferInsert;
