import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Analysis } from "@/types";

interface IdeaScoreCardProps {
  analysis: Analysis;
}

export default function IdeaScoreCard({ analysis }: IdeaScoreCardProps) {
  // 安全にデータにアクセスし、デフォルト値を設定
  const marketPotential = analysis?.marketSize?.potential ?? 0;
  const snsTrends = analysis?.snsTrends ?? { positive: 0, neutral: 0, negative: 0 };
  const technicalMaturity = analysis?.technicalMaturity ?? 0;
  const ideaScore = analysis?.ideaScore ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>アイデアスコア</CardTitle>
        <CardDescription>
          市場と技術要因に基づく総合評価
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">総合スコア</span>
              <span className="text-sm font-medium">{ideaScore}%</span>
            </div>
            <Progress value={ideaScore} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">技術成熟度</span>
              <Progress value={technicalMaturity} className="mt-2" />
            </div>
            <div>
              <span className="text-sm font-medium">市場ポテンシャル</span>
              <Progress
                value={Math.min(100, (marketPotential / 10000000) * 100)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">SNS分析</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {snsTrends.positive}%
                </div>
                <div className="text-xs text-muted-foreground">ポジティブ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {snsTrends.neutral}%
                </div>
                <div className="text-xs text-muted-foreground">中立</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {snsTrends.negative}%
                </div>
                <div className="text-xs text-muted-foreground">ネガティブ</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}