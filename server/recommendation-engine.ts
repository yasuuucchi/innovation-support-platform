import { db } from "@db";
import { ideas, interviews, projectMetrics, projectRisks, recommendations } from "@db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AIの初期化
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateRecommendations(ideaId: number) {
  try {
    // プロジェクトデータの取得
    const [idea] = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, ideaId));

    if (!idea) {
      throw new Error("Project not found");
    }

    // インタビューデータの取得
    const interviewResults = await db
      .select()
      .from(interviews)
      .where(eq(interviews.ideaId, ideaId));

    // メトリクスの取得
    const metrics = await db
      .select()
      .from(projectMetrics)
      .where(eq(projectMetrics.ideaId, ideaId));

    // リスクの取得
    const risks = await db
      .select()
      .from(projectRisks)
      .where(eq(projectRisks.ideaId, ideaId));

    // AIに分析させるためのプロンプトを生成
    const prompt = `
以下のプロジェクトデータを分析し、次のアクションを提案してください。
レスポンスはJSON形式で出力してください。

プロジェクト情報:
- 名前: ${idea.name}
- フェーズ: ${idea.currentPhase}
- 進捗状況: ${JSON.stringify(idea.phaseProgress)}
- ターゲット顧客: ${idea.targetCustomer}

インタビュー結果:
${interviewResults.map(ir => `- ${ir.content}`).join('\n')}

メトリクス:
${metrics.map(m => `- ${m.metricName}: ${JSON.stringify(m.metricValue)}`).join('\n')}

リスク:
${risks.map(r => `- ${r.riskType}: ${r.description} (重要度: ${r.severity})`).join('\n')}

必要な出力形式:
{
  "recommendations": [
    {
      "title": "推奨アクションのタイトル",
      "description": "詳細な説明",
      "priority": "high/medium/low",
      "category": "market_research/customer_development/product_development/risk_mitigation",
      "implementation_difficulty": "easy/medium/hard",
      "expected_impact": "high/medium/low"
    }
  ],
  "summary": "全体的な分析の要約",
  "next_actions": ["具体的なアクション1", "具体的なアクション2"],
  "risks": ["新たに特定されたリスク1", "新たに特定されたリスク2"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisResult = JSON.parse(response.text());

    // レコメンデーションをデータベースに保存
    for (const rec of analysisResult.recommendations) {
      await db.insert(recommendations).values({
        ideaId,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        category: rec.category,
        status: "pending",
        implementationDifficulty: rec.implementation_difficulty,
        expectedImpact: rec.expected_impact,
        source: "gemini_ai",
      });
    }

    // リスクの更新
    for (const risk of analysisResult.risks) {
      await db.insert(projectRisks).values({
        ideaId,
        riskType: "ai_identified",
        severity: "medium",
        description: risk,
        mitigationStatus: "pending",
      });
    }

    return analysisResult;
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    throw error;
  }
}

export async function generateProjectReport(ideaId: number) {
  try {
    // プロジェクトデータの取得
    const [idea] = await db
      .select()
      .from(ideas)
      .where(eq(ideas.id, ideaId));

    if (!idea) {
      throw new Error("Project not found");
    }

    // 関連データの取得
    const interviewResults = await db
      .select()
      .from(interviews)
      .where(eq(interviews.ideaId, ideaId));

    const metrics = await db
      .select()
      .from(projectMetrics)
      .where(eq(projectMetrics.ideaId, ideaId));

    const risks = await db
      .select()
      .from(projectRisks)
      .where(eq(projectRisks.ideaId, ideaId));

    const recs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.ideaId, ideaId));

    // レポート生成のプロンプト
    const prompt = `
以下のプロジェクトデータを元に、詳細なプロジェクトレポートを作成してください。
レスポンスはJSON形式で出力してください。

プロジェクト情報:
- 名前: ${idea.name}
- フェーズ: ${idea.currentPhase}
- 進捗状況: ${JSON.stringify(idea.phaseProgress)}
- ターゲット顧客: ${idea.targetCustomer}

インタビュー結果:
${interviewResults.map(ir => `- ${ir.content}`).join('\n')}

メトリクス:
${metrics.map(m => `- ${m.metricName}: ${JSON.stringify(m.metricValue)}`).join('\n')}

リスク:
${risks.map(r => `- ${r.riskType}: ${r.description} (重要度: ${r.severity})`).join('\n')}

推奨アクション:
${recs.map(r => `- ${r.title}: ${r.description} (優先度: ${r.priority})`).join('\n')}

必要な出力形式:
{
  "executive_summary": "エグゼクティブサマリー",
  "project_status": {
    "current_phase": "現在のフェーズ",
    "progress": "進捗状況の詳細な分析",
    "achievements": ["主な成果1", "主な成果2"],
    "challenges": ["課題1", "課題2"]
  },
  "market_analysis": {
    "target_market": "ターゲット市場の分析",
    "competition": "競合分析",
    "opportunities": ["機会1", "機会2"],
    "threats": ["脅威1", "脅威2"]
  },
  "customer_insights": {
    "feedback_summary": "顧客フィードバックの要約",
    "key_findings": ["主な発見1", "主な発見2"],
    "improvement_areas": ["改善領域1", "改善領域2"]
  },
  "risk_assessment": {
    "current_risks": ["現在のリスク1", "現在のリスク2"],
    "mitigation_strategies": ["対策1", "対策2"]
  },
  "recommendations": {
    "short_term": ["短期的な推奨事項1", "短期的な推奨事項2"],
    "long_term": ["長期的な推奨事項1", "長期的な推奨事項2"]
  },
  "next_steps": ["次のステップ1", "次のステップ2"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Failed to generate project report:", error);
    throw error;
  }
}
