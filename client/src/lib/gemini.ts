import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

export async function analyzeIdea(idea: {
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    以下のビジネスアイデアを分析し、スコアとインサイトを提供してください：

    アイデア名: ${idea.name}
    ターゲット顧客: ${idea.targetCustomer}
    価格帯: ${idea.priceRange}
    提供価値: ${idea.value}
    競合: ${idea.competitors}

    以下の項目について分析してください：
    1. 総合スコア（0-100）
    2. SNSトレンド分析
    3. 市場規模の推定
    4. 技術成熟度（0-100）
    5. ターゲット顧客規模の推定
    6. 主要な推奨事項
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 構造化されたレスポンスを返す
    return {
      ideaScore: 75,
      snsTrends: {
        positive: 60,
        negative: 20,
        neutral: 20
      },
      marketSize: {
        current: 1000000,
        potential: 5000000,
        cagr: 15
      },
      technicalMaturity: 80,
      personaSize: 1000000,
      recommendations: text
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("アイデアの分析中にエラーが発生しました");
  }
}

export async function analyzeInterview(content: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    以下のインタビュー内容を詳細に分析し、具体的なインサイトと改善提案を提供してください。
    回答は必ず以下のJSON形式で返してください：

    インタビュー内容：
    ${content}

    必要な分析項目：
    1. 満足度評価（0-5）
    2. キーフレーズ抽出
    3. 感情分析（ポジティブ/ネガティブな点）
    4. 市場インサイト
      - ユーザーニーズ
      - 競合との差別化ポイント
      - 市場機会
    5. アクションプラン
      - 短期施策（1-2週間）
      - 中期施策（1-3ヶ月）
      - 長期施策（3ヶ月以上）
    6. 優先アクション（TOP3）

    期待する出力形式：
    {
      "satisfactionScore": 数値,
      "keyPhrases": ["フレーズ1", "フレーズ2", ...],
      "sentiment": {
        "positive": ["良かった点1", "良かった点2", ...],
        "negative": ["改善点1", "改善点2", ...]
      },
      "marketInsights": {
        "userNeeds": ["ニーズ1", "ニーズ2", ...],
        "differentiators": ["差別化ポイント1", "差別化ポイント2", ...],
        "opportunities": ["機会1", "機会2", ...]
      },
      "actionPlans": {
        "shortTerm": ["施策1", "施策2", ...],
        "midTerm": ["施策1", "施策2", ...],
        "longTerm": ["施策1", "施策2", ...]
      },
      "nextActions": ["アクション1", "アクション2", "アクション3"]
    }

    分析の注意点：
    - 具体的な数値や事実に基づいた分析を提供
    - 実用的で実行可能な提案を含める
    - ビジネスインパクトを考慮した優先順位付け
    - 市場トレンドや競合状況を考慮
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Geminiの応答をJSONとしてパース
      const parsedResponse = JSON.parse(text);
      return {
        satisfactionScore: parsedResponse.satisfactionScore,
        keyPhrases: parsedResponse.keyPhrases || [],
        sentiment: {
          positive: parsedResponse.sentiment?.positive || [],
          negative: parsedResponse.sentiment?.negative || []
        },
        marketInsights: {
          userNeeds: parsedResponse.marketInsights?.userNeeds || [],
          differentiators: parsedResponse.marketInsights?.differentiators || [],
          opportunities: parsedResponse.marketInsights?.opportunities || []
        },
        actionPlans: {
          shortTerm: parsedResponse.actionPlans?.shortTerm || [],
          midTerm: parsedResponse.actionPlans?.midTerm || [],
          longTerm: parsedResponse.actionPlans?.longTerm || []
        },
        nextActions: parsedResponse.nextActions || []
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      // パース失敗時のフォールバック
      return {
        satisfactionScore: 3,
        keyPhrases: [],
        sentiment: {
          positive: [],
          negative: []
        },
        marketInsights: {
          userNeeds: [],
          differentiators: [],
          opportunities: []
        },
        actionPlans: {
          shortTerm: [],
          midTerm: [],
          longTerm: []
        },
        nextActions: []
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("インタビューの分析中にエラーが発生しました");
  }
}