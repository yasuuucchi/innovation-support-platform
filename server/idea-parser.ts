import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf-parse/lib/pdf-parse.js";
import { db } from "@db";
import { ideas } from "@db/schema";

// Gemini AIの初期化
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface IdeaInfo {
  name: string;
  targetCustomer: string;
  priceRange: string;
  value: string;
  competitors: string;
  currentPhase: string;
  phaseProgress: {
    idea_exploration: number;
    customer_discovery: number;
    customer_problem_fit: number;
    problem_solution_fit: number;
    solution_product_fit: number;
    product_market_fit: number;
    scale_up: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// テキストの前処理
function preprocessText(text: string): string {
  // URLを削除
  text = text.replace(/https?:\/\/[^\s]+/g, '');
  // Markdown記法を削除
  text = text.replace(/[*_~`#]/g, '');
  // 空行を整理
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

// テキストを分割（50,000文字ごと）
function splitText(text: string): string[] {
  const maxLength = 50000;
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }

  return chunks;
}

// Gemini APIを使用してアイデア情報を抽出
async function extractIdeaInfoFromText(text: string): Promise<IdeaInfo> {
  const prompt = `
以下のテキストからビジネスアイデアの情報を抽出し、JSONフォーマットで返してください。
必要な情報：
- name: アイデアのタイトル（短く簡潔に）
- targetCustomer: ターゲット顧客層
- priceRange: 価格帯
- value: 提供価値
- competitors: 競合他社
- currentPhase: 現在のフェーズ（"idea_exploration", "customer_discovery", "customer_problem_fit", "problem_solution_fit", "solution_product_fit", "product_market_fit", "scale_up"のいずれか）

テキスト:
${text}

レスポンスは以下のJSONフォーマットで返してください:
{
  "name": "string",
  "targetCustomer": "string",
  "priceRange": "string",
  "value": "string",
  "competitors": "string",
  "currentPhase": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSON部分を抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSONフォーマットのレスポンスが見つかりません");
    }

    const extractedData = JSON.parse(jsonMatch[0]);
    const now = new Date();

    return {
      ...extractedData,
      phaseProgress: {
        idea_exploration: 0,
        customer_discovery: 0,
        customer_problem_fit: 0,
        problem_solution_fit: 0,
        solution_product_fit: 0,
        product_market_fit: 0,
        scale_up: 0
      },
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error("Failed to extract idea info:", error);
    throw new Error("アイデア情報の抽出に失敗しました");
  }
}

// PDFからテキストを抽出
export async function extractIdeaFromPdf(pdfBuffer: Buffer): Promise<IdeaInfo> {
  try {
    const data = await PDFParser(pdfBuffer);
    const text = preprocessText(data.text);

    if (!text) {
      throw new Error("PDFからテキストを抽出できませんでした");
    }

    return await extractIdeaInfoFromText(text);
  } catch (error) {
    console.error("Failed to extract text from PDF:", error);
    throw new Error("PDFの処理に失敗しました");
  }
}

// テキストからアイデアを抽出
export async function extractIdeaFromText(text: string): Promise<IdeaInfo> {
  try {
    const processedText = preprocessText(text);

    if (!processedText) {
      throw new Error("テキストが空です");
    }

    if (processedText.length > 50000) {
      throw new Error("テキストが長すぎます（最大50,000文字）");
    }

    return await extractIdeaInfoFromText(processedText);
  } catch (error) {
    console.error("Failed to extract idea from text:", error);
    throw error;
  }
}

// 抽出したアイデアを保存
export async function saveExtractedIdea(ideaInfo: IdeaInfo) {
  try {
    // ユーザーIDはテスト用に1を使用（実際の実装では認証システムから取得する必要があります）
    const [newIdea] = await db.insert(ideas).values({
      name: ideaInfo.name,
      targetCustomer: ideaInfo.targetCustomer,
      priceRange: ideaInfo.priceRange,
      value: ideaInfo.value,
      competitors: ideaInfo.competitors,
      currentPhase: ideaInfo.currentPhase,
      phaseProgress: ideaInfo.phaseProgress,
      createdAt: ideaInfo.createdAt,
      updatedAt: ideaInfo.updatedAt,
      userId: 1 // テスト用の固定値
    }).returning();

    return newIdea;
  } catch (error) {
    console.error("Failed to save idea:", error);
    throw new Error("アイデアの保存に失敗しました");
  }
}