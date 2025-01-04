import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { ideas, analysis, behaviorLogs, interviews, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzeInterview } from "./gemini";
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
      res.json(newIdea[0]);
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

      // ダミーの分析結果を返す
      const dummyAnalysis = {
        satisfactionScore: 4,
        keyPhrases: ["使いやすい", "効率的", "革新的"],
        sentiment: {
          positive: ["操作が直感的", "レスポンスが早い", "デザインが良い"],
          negative: ["一部機能がわかりにくい", "価格が高い"]
        },
        marketInsights: {
          userNeeds: ["効率的な業務管理", "データ分析", "自動化"],
          differentiators: ["AIによる自動化", "使いやすいUI", "豊富な機能"],
          opportunities: ["グローバル展開", "新機能の追加", "価格最適化"]
        },
        actionPlans: {
          shortTerm: ["UIの改善", "バグ修正", "ユーザーフィードバックの収集"],
          midTerm: ["新機能の開発", "パフォーマンス最適化"],
          longTerm: ["グローバル展開", "新規市場への参入"]
        },
        nextActions: [
          "ユーザーインターフェースの改善",
          "主要機能のパフォーマンス最適化",
          "ユーザーフィードバックシステムの実装"
        ]
      };

      // インタビュー結果をデータベースに保存
      const newInterview = await db.insert(interviews).values({
        ideaId,
        content,
        satisfactionScore: dummyAnalysis.satisfactionScore,
        keyPhrases: dummyAnalysis.keyPhrases,
        sentiment: dummyAnalysis.sentiment,
        marketInsights: dummyAnalysis.marketInsights,
        actionPlans: dummyAnalysis.actionPlans,
        nextActions: dummyAnalysis.nextActions,
        createdAt: new Date(),
      }).returning();

      res.json(newInterview[0]);
    } catch (error) {
      console.error("Failed to create interview:", error);
      res.status(500).json({ error: "インタビューの分析に失敗しました" });
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