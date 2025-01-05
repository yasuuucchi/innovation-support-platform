import { GoogleGenerativeAI } from "@google/generative-ai";
import { ideas } from "@db/schema";
import { db } from "@db";

// Gemini AIの初期化
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface ExtractedIdeaInfo {
  name: string;
  targetCustomer: string;
  value: string;
  priceRange: string;
  competitors: string;
  currentPhase: string;
}

export async function extractIdeaFromText(text: string): Promise<ExtractedIdeaInfo> {
  const prompt = `
以下のテキストからビジネスアイデアの情報を抽出し、JSONフォーマットで出力してください。
必要な情報は以下の通りです：
- name: アイデア/プロジェクトの名前
- targetCustomer: ターゲット顧客
- value: 提供価値
- priceRange: 価格帯
- competitors: 競合
- currentPhase: フェーズ（"problem_validation", "solution_validation", "business_model_validation", "growth"のいずれか）

テキスト:
${text}

JSON形式で出力してください。存在しない情報は空文字列を設定してください。
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const ideaInfo = JSON.parse(response.text());

  return {
    name: ideaInfo.name || '',
    targetCustomer: ideaInfo.targetCustomer || '',
    value: ideaInfo.value || '',
    priceRange: ideaInfo.priceRange || '',
    competitors: ideaInfo.competitors || '',
    currentPhase: ideaInfo.currentPhase || 'problem_validation',
  };
}

export async function extractIdeaFromPdf(buffer: Buffer): Promise<ExtractedIdeaInfo> {
  try {
    // PDFのテキストを直接文字列として扱う
    const text = buffer.toString('utf-8');
    return extractIdeaFromText(text);
  } catch (error) {
    console.error('Failed to parse PDF:', error);
    throw new Error('PDFの解析に失敗しました');
  }
}

export async function saveExtractedIdea(ideaInfo: ExtractedIdeaInfo) {
  try {
    const [newIdea] = await db.insert(ideas).values({
      ...ideaInfo,
      phaseProgress: {},
      updatedAt: new Date(),
      createdAt: new Date(),
    }).returning();

    return newIdea;
  } catch (error) {
    console.error('Failed to save idea:', error);
    throw new Error('アイデアの保存に失敗しました');
  }
}