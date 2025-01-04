import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { ideas, analysis, behaviorLogs, interviews, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzeIdea, analyzeInterview } from "../client/src/lib/gemini";
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "./auth";
import bcrypt from "bcryptjs";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const SessionStore = MemoryStore(session);

  // セッション設定
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24時間
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24時間
      },
    })
  );

  // Passportの初期化
  app.use(passport.initialize());
  app.use(passport.session());

  // 認証関連のエンドポイント
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      // ユーザー名の重複チェック
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (existingUser.length > 0) {
        return res.status(400).json({ message: "ユーザー名はすでに使用されています" });
      }

      // パスワードのハッシュ化
      const hashedPassword = await bcrypt.hash(password, 10);

      // ユーザーの作成
      const newUser = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      res.json({ message: "アカウントが作成されました" });
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "アカウントの作成に失敗しました" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "ログインしました" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "ログアウトしました" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        isAuthenticated: true,
        user: req.user,
      });
    } else {
      res.json({
        isAuthenticated: false,
        user: null,
      });
    }
  });

  // Ideas
  app.post("/api/ideas", async (req, res) => {
    try {
      const newIdea = await db.insert(ideas).values(req.body).returning();

      // 新規アイデアの分析を実行
      const analysisResult = await analyzeIdea(newIdea[0]);
      const newAnalysis = await db.insert(analysis).values({
        ideaId: newIdea[0].id,
        ideaScore: analysisResult.ideaScore,
        snsTrends: analysisResult.snsTrends,
        marketSize: analysisResult.marketSize,
        technicalMaturity: analysisResult.technicalMaturity,
        personaSize: analysisResult.personaSize,
      }).returning();

      res.json({
        ...newIdea[0],
        analysis: newAnalysis[0],
      });
    } catch (error) {
      console.error("Failed to create idea:", error);
      res.status(500).json({ error: "Failed to create idea" });
    }
  });

  app.get("/api/ideas", async (req, res) => {
    try {
      const allIdeas = await db.select().from(ideas);
      res.json(allIdeas);
    } catch (error) {
      console.error("Failed to fetch ideas:", error);
      res.status(500).json({ error: "Failed to fetch ideas" });
    }
  });

  app.get("/api/ideas/:id", async (req, res) => {
    try {
      const idea = await db.select().from(ideas).where(eq(ideas.id, parseInt(req.params.id)));
      if (idea.length === 0) {
        return res.status(404).json({ error: "Idea not found" });
      }
      res.json(idea[0]);
    } catch (error) {
      console.error("Failed to fetch idea:", error);
      res.status(500).json({ error: "Failed to fetch idea" });
    }
  });

  // Analysis
  app.post("/api/analysis", async (req, res) => {
    try {
      const newAnalysis = await db.insert(analysis).values(req.body).returning();
      res.json(newAnalysis[0]);
    } catch (error) {
      console.error("Failed to create analysis:", error);
      res.status(500).json({ error: "Failed to create analysis" });
    }
  });

  app.get("/api/analysis/:ideaId", async (req, res) => {
    try {
      const ideaAnalysis = await db
        .select()
        .from(analysis)
        .where(eq(analysis.ideaId, parseInt(req.params.ideaId)));
      res.json(ideaAnalysis[0] || null);
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Behavior Logs
  app.post("/api/behavior-logs", async (req, res) => {
    try {
      const newLog = await db.insert(behaviorLogs).values(req.body).returning();
      res.json(newLog[0]);
    } catch (error) {
      console.error("Failed to create behavior log:", error);
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
      console.error("Failed to fetch behavior logs:", error);
      res.status(500).json({ error: "Failed to fetch behavior logs" });
    }
  });

  // Interviews
  app.post("/api/interviews", async (req, res) => {
    try {
      const { ideaId, content } = req.body;

      // Gemini APIを使用してインタビュー内容を分析
      const analysisResult = await analyzeInterview(content);

      // インタビュー結果をデータベースに保存
      const newInterview = await db.insert(interviews).values({
        ideaId,
        content,
        satisfactionScore: analysisResult.satisfactionScore,
        keyPhrases: analysisResult.keyPhrases,
        sentiment: analysisResult.sentiment,
      }).returning();

      res.json(newInterview[0]);
    } catch (error) {
      console.error("Failed to create interview:", error);
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
      console.error("Failed to fetch interviews:", error);
      res.status(500).json({ error: "Failed to fetch interviews" });
    }
  });

  return httpServer;
}