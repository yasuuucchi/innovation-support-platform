import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { extractIdeaFromText, extractIdeaFromPdf, saveExtractedIdea } from './idea-parser';
import { db } from "@db";
import { ideas, analysis, behaviorLogs, interviews, projectRisks, projectMetrics, users, recommendations } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzeInterview } from "./gemini";
import { analyzeMarketData } from "./market-analysis";
import express from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "./auth";
import bcrypt from "bcryptjs";
import { generateRecommendations, generateProjectReport } from "./recommendation-engine";

// ダミーの行動ログデータを生成する関数
function generateDummyBehaviorLogs(ideaId: number) {
  const eventTypes = [
    "page_view",
    "button_click",
    "form_submit",
    "sign_up",
    "feature_usage"
  ];

  const now = new Date();
  const logs = [];

  // 過去7日分のログを生成
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // 1日あたり3-8個のランダムなイベントを生成
    const eventsCount = Math.floor(Math.random() * 6) + 3;

    for (let j = 0; j < eventsCount; j++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      let eventData = {};

      switch (eventType) {
        case "page_view":
          eventData = {
            path: ["/dashboard", "/analytics", "/settings"][Math.floor(Math.random() * 3)],
            duration: Math.floor(Math.random() * 300) + 30
          };
          break;
        case "button_click":
          eventData = {
            buttonId: ["save", "analyze", "export"][Math.floor(Math.random() * 3)],
            context: "main_dashboard"
          };
          break;
        case "form_submit":
          eventData = {
            formType: ["feedback", "settings", "profile"][Math.floor(Math.random() * 3)],
            success: Math.random() > 0.1
          };
          break;
        case "sign_up":
          eventData = {
            method: ["email", "google", "github"][Math.floor(Math.random() * 3)],
            completed: Math.random() > 0.2
          };
          break;
        case "feature_usage":
          eventData = {
            featureId: ["analysis", "export", "share"][Math.floor(Math.random() * 3)],
            duration: Math.floor(Math.random() * 180) + 20
          };
          break;
      }

      logs.push({
        id: logs.length + 1,
        ideaId,
        eventType,
        eventData,
        createdAt: date.toISOString()
      });
    }
  }

  return logs.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

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

  // 行動ログのエンドポイントを更新
  app.get("/api/behavior-logs/:ideaId", async (req, res) => {
    try {
      // ダミーデータを生成して返す
      const dummyLogs = generateDummyBehaviorLogs(parseInt(req.params.ideaId));
      res.json(dummyLogs);
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

  // プロジェクトのリスク情報を取得
  app.get("/api/project-risks/:ideaId", async (req, res) => {
    try {
      const risks = await db
        .select()
        .from(projectRisks)
        .where(eq(projectRisks.ideaId, parseInt(req.params.ideaId)));
      res.json(risks);
    } catch (error) {
      console.error("Failed to fetch project risks:", error);
      res.status(500).json({ error: "Failed to fetch project risks" });
    }
  });

  // プロジェクトの指標情報を取得
  app.get("/api/project-metrics/:ideaId", async (req, res) => {
    try {
      const metrics = await db
        .select()
        .from(projectMetrics)
        .where(eq(projectMetrics.ideaId, parseInt(req.params.ideaId)));
      res.json(metrics);
    } catch (error) {
      console.error("Failed to fetch project metrics:", error);
      res.status(500).json({ error: "Failed to fetch project metrics" });
    }
  });

  // 市場分析エンドポイントを追加
  app.post("/api/market-analysis", async (req, res) => {
    try {
      const { ideaId, ...ideaData } = req.body;

      // Geminiを使用して市場分析を実行
      const analysisResult = await analyzeMarketData(ideaData);

      // 分析結果をデータベースに保存
      const newAnalysis = await db.insert(analysis).values({
        ideaId: parseInt(ideaId),
        ideaScore: analysisResult.ideaScore,
        scoreDetails: analysisResult.scoreDetails,
        marketInsights: analysisResult.marketInsights,
        recommendations: analysisResult.recommendations,
        createdAt: new Date(),
      }).returning();

      res.json(newAnalysis[0]);
    } catch (error) {
      console.error("Failed to perform market analysis:", error);
      res.status(500).json({ error: "市場分析の実行に失敗しました" });
    }
  });

  // Ideas
  app.post("/api/ideas/:id/analyze", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId));

      if (idea.length === 0) {
        return res.status(404).json({ error: "アイデアが見つかりません" });
      }

      // ダミーの分析結果を返す（実際のアプリケーションではGemini APIを使用）
      const analysisResult = {
        ideaScore: Math.floor(Math.random() * 30) + 70, // 70-100の範囲
        scoreDetails: {
          marketPotential: Math.floor(Math.random() * 40) + 60,
          competitiveAdvantage: Math.floor(Math.random() * 40) + 60,
          feasibility: Math.floor(Math.random() * 40) + 60,
          profitability: Math.floor(Math.random() * 40) + 60,
          innovation: Math.floor(Math.random() * 40) + 60
        },
        marketInsights: {
          marketSize: "約50億円規模の市場",
          growthRate: "年間15-20%の成長率",
          competitorAnalysis: [
            "主要競合3社が市場の80%を占有",
            "新規参入が増加傾向",
            "差別化が重要な成功要因"
          ],
          risks: [
            "技術の急速な変化",
            "規制環境の変化",
            "新規参入による競争激化"
          ],
          opportunities: [
            "未開拓の市場セグメント",
            "技術革新による新しい用途",
            "グローバル展開の可能性"
          ]
        },
        recommendations: [
          "ユーザーインターフェースの改善に注力",
          "マーケティング戦略の見直し",
          "新機能の開発を加速"
        ]
      };

      // 分析結果をデータベースに保存
      const newAnalysis = await db
        .insert(analysis)
        .values({
          ideaId,
          ideaScore: analysisResult.ideaScore,
          scoreDetails: analysisResult.scoreDetails,
          marketInsights: analysisResult.marketInsights,
          recommendations: analysisResult.recommendations,
          createdAt: new Date()
        })
        .onConflictDoUpdate({
          target: [analysis.ideaId],
          set: {
            ideaScore: analysisResult.ideaScore,
            scoreDetails: analysisResult.scoreDetails,
            marketInsights: analysisResult.marketInsights,
            recommendations: analysisResult.recommendations
          }
        })
        .returning();

      res.json(newAnalysis[0]);
    } catch (error) {
      console.error("Failed to analyze idea:", error);
      res.status(500).json({ error: "市場分析の更新に失敗しました" });
    }
  });

  // フェーズの更新
  app.post("/api/ideas/:id/phase", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const { phase } = req.body;

      if (!phase) {
        return res.status(400).json({ error: "フェーズが指定されていません" });
      }

      const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId));

      if (idea.length === 0) {
        return res.status(404).json({ error: "アイデアが見つかりません" });
      }

      // フェーズを更新
      await db
        .update(ideas)
        .set({
          currentPhase: phase,
          updatedAt: new Date(),
        })
        .where(eq(ideas.id, ideaId));

      res.json({ message: "フェーズを更新しました" });
    } catch (error) {
      console.error("Failed to update phase:", error);
      res.status(500).json({ error: "フェーズの更新に失敗しました" });
    }
  });


  // レコメンデーション生成エンドポイント
  app.post("/api/ideas/:id/recommendations", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const recommendations = await generateRecommendations(ideaId);
      res.json(recommendations);
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      res.status(500).json({ error: "レコメンデーションの生成に失敗しました" });
    }
  });

  // レポート生成エンドポイント
  app.post("/api/ideas/:id/report", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const report = await generateProjectReport(ideaId);
      res.json(report);
    } catch (error) {
      console.error("Failed to generate report:", error);
      res.status(500).json({ error: "レポートの生成に失敗しました" });
    }
  });

  // 既存のレコメンデーション取得エンドポイントを更新
  app.get("/api/ideas/:id/recommendations", async (req, res) => {
    try {
      const ideaId = parseInt(req.params.id);
      const ideaRecommendations = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.ideaId, ideaId))
        .orderBy(recommendations.createdAt);
      res.json(ideaRecommendations);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      res.status(500).json({ error: "レコメンデーションの取得に失敗しました" });
    }
  });

  // ファイルアップロードの設定
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB制限
    },
    fileFilter: (req, file, cb) => {
      // PDFファイルのみを許可
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('PDFファイルのみアップロード可能です'));
      }
    }
  });

  // テキストファイルからアイデアを抽出
  app.post("/api/ideas/extract-from-text", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "テキストが必要です" });
      }

      const ideaInfo = await extractIdeaFromText(text);
      const newIdea = await saveExtractedIdea(ideaInfo);
      res.json(newIdea);
    } catch (error) {
      console.error("Failed to extract idea from text:", error);
      res.status(500).json({ error: "テキストからのアイデア抽出に失敗しました" });
    }
  });

  // PDFファイルからアイデアを抽出
  app.post("/api/ideas/extract-from-pdf", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDFファイルが必要です" });
      }

      console.log('PDF upload received:', {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const ideaInfo = await extractIdeaFromPdf(req.file.buffer);
      console.log('Extracted idea info:', ideaInfo);

      const newIdea = await saveExtractedIdea(ideaInfo);
      res.json(newIdea);
    } catch (error) {
      console.error("Failed to extract idea from PDF:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "PDFからのアイデア抽出に失敗しました" });
    }
  });

  return httpServer;
}