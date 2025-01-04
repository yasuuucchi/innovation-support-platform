import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  targetCustomer: text("target_customer").notNull(),
  priceRange: text("price_range").notNull(),
  value: text("value").notNull(),
  competitors: text("competitors").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  ideaScore: integer("idea_score").notNull(),
  snsTrends: jsonb("sns_trends").notNull(),
  marketSize: jsonb("market_size").notNull(),
  technicalMaturity: integer("technical_maturity").notNull(),
  personaSize: integer("persona_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const behaviorLogs = pgTable("behavior_logs", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  content: text("content").notNull(),
  satisfactionScore: integer("satisfaction_score").notNull(),
  keyPhrases: jsonb("key_phrases").notNull(),
  sentiment: jsonb("sentiment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type Analysis = typeof analysis.$inferSelect;
export type BehaviorLog = typeof behaviorLogs.$inferSelect;
export type Interview = typeof interviews.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertIdeaSchema = createInsertSchema(ideas);
export const selectIdeaSchema = createSelectSchema(ideas);