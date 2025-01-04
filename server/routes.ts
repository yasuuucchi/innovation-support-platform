import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { ideas, analysis, behaviorLogs, interviews } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Ideas
  app.post("/api/ideas", async (req, res) => {
    try {
      const newIdea = await db.insert(ideas).values(req.body).returning();
      res.json(newIdea[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create idea" });
    }
  });

  app.get("/api/ideas", async (req, res) => {
    try {
      const allIdeas = await db.select().from(ideas);
      res.json(allIdeas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  // Analysis
  app.post("/api/analysis", async (req, res) => {
    try {
      const newAnalysis = await db.insert(analysis).values(req.body).returning();
      res.json(newAnalysis[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create analysis" });
    }
  });

  app.get("/api/analysis/:ideaId", async (req, res) => {
    try {
      const ideaAnalysis = await db
        .select()
        .from(analysis)
        .where(eq(analysis.ideaId, parseInt(req.params.ideaId)));
      res.json(ideaAnalysis[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Behavior Logs
  app.post("/api/behavior-logs", async (req, res) => {
    try {
      const newLog = await db.insert(behaviorLogs).values(req.body).returning();
      res.json(newLog[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create behavior log" });
    }
  });

  app.get("/api/behavior-logs/:ideaId", async (req, res) => {
    try {
      const logs = await db
        .select()
        .from(behaviorLogs)
        .where(eq(behaviorLogs.ideaId, parseInt(req.params.ideaId)));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch behavior logs" });
    }
  });

  // Interviews
  app.post("/api/interviews", async (req, res) => {
    try {
      const newInterview = await db.insert(interviews).values(req.body).returning();
      res.json(newInterview[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create interview" });
    }
  });

  app.get("/api/interviews/:ideaId", async (req, res) => {
    try {
      const ideaInterviews = await db
        .select()
        .from(interviews)
        .where(eq(interviews.ideaId, parseInt(req.params.ideaId)));
      res.json(ideaInterviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  return httpServer;
}
