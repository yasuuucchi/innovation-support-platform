import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY must be set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function analyzeMarketData(ideaData: {
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      あなたは市場分析の専門家として、以下のアイデアを分析し、JSON形式でレポートを作成してください。

      === アイデア情報 ===
      名称: ${ideaData.name}
      ターゲット顧客: ${ideaData.targetCustomer}
      価格帯: ${ideaData.priceRange}
      提供価値: ${ideaData.value}
      競合情報: ${ideaData.competitors}

      === 分析要件 ===
      以下の項目を分析し、必ずJSON形式で回答してください：

      {
        "ideaScore": 1から100の数値（総合評価スコア）,
        "scoreDetails": {
          "marketPotential": 1から100の数値（市場規模と成長性）,
          "competitiveAdvantage": 1から100の数値（競合優位性）,
          "feasibility": 1から100の数値（実現可能性）,
          "profitability": 1から100の数値（収益性）,
          "innovation": 1から100の数値（革新性）
        },
        "marketInsights": {
          "marketSize": "推定市場規模の説明",
          "growthRate": "市場成長率の予測",
          "competitorAnalysis": ["競合分析のポイントを配列で"],
          "risks": ["リスク要因を配列で"],
          "opportunities": ["市場機会を配列で"]
        },
        "recommendations": ["推奨アクションを配列で"]
      }

      注意事項：
      1. 必ず上記のJSON形式で回答してください
      2. スコアは現実的な評価に基づいて設定してください
      3. 具体的な数値や事実に基づく分析を心がけてください
      4. 競合分析は具体的な差別化ポイントを含めてください
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // レスポンスからJSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON response not found in the API response");
    }

    const jsonText = jsonMatch[0];
    const parsedResponse = JSON.parse(jsonText);

    // 構造の検証と型の保証
    return {
      ideaScore: Number(parsedResponse.ideaScore) || 0,
      scoreDetails: {
        marketPotential: Number(parsedResponse.scoreDetails?.marketPotential) || 0,
        competitiveAdvantage: Number(parsedResponse.scoreDetails?.competitiveAdvantage) || 0,
        feasibility: Number(parsedResponse.scoreDetails?.feasibility) || 0,
        profitability: Number(parsedResponse.scoreDetails?.profitability) || 0,
        innovation: Number(parsedResponse.scoreDetails?.innovation) || 0
      },
      marketInsights: {
        marketSize: String(parsedResponse.marketInsights?.marketSize) || "",
        growthRate: String(parsedResponse.marketInsights?.growthRate) || "",
        competitorAnalysis: Array.isArray(parsedResponse.marketInsights?.competitorAnalysis) 
          ? parsedResponse.marketInsights.competitorAnalysis 
          : [],
        risks: Array.isArray(parsedResponse.marketInsights?.risks) 
          ? parsedResponse.marketInsights.risks 
          : [],
        opportunities: Array.isArray(parsedResponse.marketInsights?.opportunities) 
          ? parsedResponse.marketInsights.opportunities 
          : []
      },
      recommendations: Array.isArray(parsedResponse.recommendations) 
        ? parsedResponse.recommendations 
        : []
    };
  } catch (error) {
    console.error("Market analysis error:", error);
    throw error;
  }
}
