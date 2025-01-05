import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Analysis } from "@/types";
import { toast } from "@/hooks/use-toast";

interface IdeaScoreCardProps {
  analysis: Analysis;
  ideaId: number;
}

export default function IdeaScoreCard({ analysis, ideaId }: IdeaScoreCardProps) {
  const queryClient = useQueryClient();

  // 安全にデータにアクセスし、デフォルト値を設定
  const marketPotential = analysis?.marketSize?.potential ?? 0;
  const snsTrends = analysis?.snsTrends ?? { positive: 0, neutral: 0, negative: 0 };
  const technicalMaturity = analysis?.technicalMaturity ?? 0;
  const ideaScore = analysis?.ideaScore ?? 0;

  const updateAnalysis = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/analyze`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("市場分析の更新に失敗しました");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ideas/${ideaId}`] });
      toast({
        title: "更新完了",
        description: "市場分析が更新されました",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "市場分析の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>アイデアスコア</CardTitle>
            <CardDescription>
              市場と技術要因に基づく総合評価
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateAnalysis.mutate()}
            disabled={updateAnalysis.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${updateAnalysis.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
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