import { GoogleGenerativeAI } from "@google/generative-ai";

// APIキーを取得する関数
async function getGeminiApiKey() {
  try {
    // 絶対パスを使用してAPIエンドポイントにアクセス
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/vite-env`);

    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status} ${response.statusText}`);
    }

    const env = await response.json();
    if (!env.VITE_GEMINI_API_KEY) {
      throw new Error("Gemini API key not found in environment");
    }

    return env.VITE_GEMINI_API_KEY;
  } catch (error) {
    console.error("Error fetching Gemini API key:", error);
    throw error;
  }
}

let genAI: GoogleGenerativeAI | null = null;

// Gemini APIの初期化
async function initializeGeminiAI() {
  if (!genAI) {
    try {
      const apiKey = await getGeminiApiKey();
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error("Failed to initialize Gemini AI:", error);
      throw new Error("Gemini APIの初期化に失敗しました");
    }
  }
  return genAI;
}

export async function analyzeIdea(idea: {
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
}) {
  const ai = await initializeGeminiAI();
  const model = ai.getGenerativeModel({ model: "gemini-pro" });

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
  try {
    const ai = await initializeGeminiAI();
    const model = ai.getGenerativeModel({ model: "gemini-pro" });

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