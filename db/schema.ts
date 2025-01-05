import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
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
  currentPhase: text("current_phase").notNull().default("idea_exploration"),
  phaseProgress: jsonb("phase_progress").notNull().default({
    idea_exploration: 0,
    customer_discovery: 0,
    customer_problem_fit: 0,
    problem_solution_fit: 0,
    solution_product_fit: 0,
    product_market_fit: 0,
    scale_up: 0
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const projectMetrics = pgTable("project_metrics", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  phase: text("phase").notNull(),
  metricName: text("metric_name").notNull(),
  metricValue: jsonb("metric_value").notNull(),
  targetValue: jsonb("target_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectRisks = pgTable("project_risks", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  riskType: text("risk_type").notNull(),
  severity: text("severity").notNull(), // low, medium, high
  description: text("description").notNull(),
  mitigationStatus: text("mitigation_status").notNull(), // pending, in_progress, mitigated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  ideaScore: integer("idea_score").notNull(),
  scoreDetails: jsonb("score_details").notNull().default({
    marketPotential: 0,
    competitiveAdvantage: 0,
    feasibility: 0,
    profitability: 0,
    innovation: 0
  }),
  marketInsights: jsonb("market_insights").notNull().default({
    marketSize: "",
    growthRate: "",
    competitorAnalysis: [],
    risks: [],
    opportunities: []
  }),
  recommendations: jsonb("recommendations").notNull().default([]),
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
  marketInsights: jsonb("market_insights").notNull(),
  actionPlans: jsonb("action_plans").notNull(),
  nextActions: jsonb("next_actions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull(),
  source: text("source").notNull(),
  implementationDifficulty: text("implementation_difficulty").notNull(),
  expectedImpact: text("expected_impact").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// 型定義のエクスポート
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
export type Analysis = typeof analysis.$inferSelect;
export type NewAnalysis = typeof analysis.$inferInsert;
export type BehaviorLog = typeof behaviorLogs.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;
export type ProjectMetric = typeof projectMetrics.$inferSelect;
export type ProjectRisk = typeof projectRisks.$inferSelect;

// Zodスキーマのエクスポート
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertIdeaSchema = createInsertSchema(ideas);
export const selectIdeaSchema = createSelectSchema(ideas);
export const insertRecommendationSchema = createInsertSchema(recommendations);
export const selectRecommendationSchema = createSelectSchema(recommendations);
export const insertProjectMetricSchema = createInsertSchema(projectMetrics);
export const insertProjectRiskSchema = createInsertSchema(projectRisks);