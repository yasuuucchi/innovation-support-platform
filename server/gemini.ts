import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.VITE_GEMINI_API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY must be set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function analyzeInterview(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      あなたは製品マネージャーとして、以下のインタビュー内容を分析し、JSON形式でレポートを作成してください。

      === インタビュー内容 ===
      ${content}

      === 分析要件 ===
      以下の項目を分析し、必ずJSON形式で回答してください：

      {
        "satisfactionScore": 0から5の数値（満足度）,
        "keyPhrases": [重要なキーフレーズを配列で],
        "sentiment": {
          "positive": [良かった点を配列で],
          "negative": [改善点を配列で]
        },
        "marketInsights": {
          "userNeeds": [ユーザーニーズを配列で],
          "differentiators": [差別化ポイントを配列で],
          "opportunities": [市場機会を配列で]
        },
        "actionPlans": {
          "shortTerm": [1-2週間で実施可能な施策を配列で],
          "midTerm": [1-3ヶ月で実施する施策を配列で],
          "longTerm": [3ヶ月以上の長期施策を配列で]
        },
        "nextActions": [優先度の高い具体的なアクション3つを配列で]
      }

      注意事項：
      1. 必ず上記のJSON形式で回答してください
      2. 配列は空にせず、具体的な内容を含めてください
      3. 満足度スコアは文脈から適切に判断してください
      4. アクションプランは具体的で実行可能な内容にしてください
      5. 余分なテキストは含めないでください
    `;

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("Received response from Gemini API");
    const response = await result.response;
    let text = response.text();

    // レスポンスからJSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON response not found in the API response");
    }

    const jsonText = jsonMatch[0];
    console.log("Parsed JSON response:", jsonText);

    const parsedResponse = JSON.parse(jsonText);

    // 構造の検証と型の保証
    return {
      satisfactionScore: Number(parsedResponse.satisfactionScore) || 3,
      keyPhrases: Array.isArray(parsedResponse.keyPhrases) ? parsedResponse.keyPhrases : [],
      sentiment: {
        positive: Array.isArray(parsedResponse.sentiment?.positive) ? parsedResponse.sentiment.positive : [],
        negative: Array.isArray(parsedResponse.sentiment?.negative) ? parsedResponse.sentiment.negative : []
      },
      marketInsights: {
        userNeeds: Array.isArray(parsedResponse.marketInsights?.userNeeds) ? parsedResponse.marketInsights.userNeeds : [],
        differentiators: Array.isArray(parsedResponse.marketInsights?.differentiators) ? parsedResponse.marketInsights.differentiators : [],
        opportunities: Array.isArray(parsedResponse.marketInsights?.opportunities) ? parsedResponse.marketInsights.opportunities : []
      },
      actionPlans: {
        shortTerm: Array.isArray(parsedResponse.actionPlans?.shortTerm) ? parsedResponse.actionPlans.shortTerm : [],
        midTerm: Array.isArray(parsedResponse.actionPlans?.midTerm) ? parsedResponse.actionPlans.midTerm : [],
        longTerm: Array.isArray(parsedResponse.actionPlans?.longTerm) ? parsedResponse.actionPlans.longTerm : []
      },
      nextActions: Array.isArray(parsedResponse.nextActions) ? parsedResponse.nextActions : []
    };
  } catch (error) {
    console.error("Interview analysis error:", error);
    throw error;
  }
}
