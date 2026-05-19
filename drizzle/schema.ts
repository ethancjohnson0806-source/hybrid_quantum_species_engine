import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Query Sessions - stores user queries and processing results
export const querySessions = mysqlTable("query_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  query: text("query").notNull(),
  emotionalValence: varchar("emotionalValence", { length: 10 }).default("0"),
  urgency: varchar("urgency", { length: 10 }).default("0.5"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuerySession = typeof querySessions.$inferSelect;
export type InsertQuerySession = typeof querySessions.$inferInsert;

// Chamber States - stores the output from each chamber for a query session
export const chamberStates = mysqlTable("chamber_states", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  chamberName: varchar("chamberName", { length: 64 }).notNull(), // "outer_court", "inner_court", "holy_place", "holy_of_holies"
  stateData: text("stateData").notNull(), // JSON string
  coherenceScore: varchar("coherenceScore", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChamberState = typeof chamberStates.$inferSelect;
export type InsertChamberState = typeof chamberStates.$inferInsert;