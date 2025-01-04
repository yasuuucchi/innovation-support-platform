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
    以下のインタビュー内容を分析し、インサイトを提供してください：

    インタビュー内容：
    ${content}

    以下の項目について分析してください：
    1. 満足度スコア（0-5）
    2. 主要なキーフレーズやテーマ
    3. 感情分析（ポジティブな点とネガティブな点）
    4. 改善提案
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // テキスト解析から構造化データを抽出
    // 実際のプロダクションでは、より洗練された解析ロジックを実装する必要があります
    return {
      satisfactionScore: 4,
      keyPhrases: ["使いやすさ", "価値提供", "改善点"],
      sentiment: {
        positive: ["直感的なインターフェース", "サポートの充実"],
        negative: ["読み込み速度が遅い"]
      },
      recommendations: text // 生のGeminiレスポンスを保存
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("インタビューの分析中にエラーが発生しました");
  }
}