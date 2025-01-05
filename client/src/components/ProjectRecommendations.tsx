import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Brain,
  Download,
  FileDown,
  RefreshCw,
  Star,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Recommendation } from "@db/schema";
import { Badge } from "@/components/ui/badge";

interface ProjectRecommendationsProps {
  ideaId: number;
}

export default function ProjectRecommendations({ ideaId }: ProjectRecommendationsProps) {
  const queryClient = useQueryClient();

  // レコメンデーションの取得
  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: [`/api/ideas/${ideaId}/recommendations`],
  });

  // レコメンデーションの更新
  const updateRecommendations = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/recommendations`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("レコメンデーションの更新に失敗しました");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/ideas/${ideaId}/recommendations`],
      });
      toast({
        title: "更新完了",
        description: "レコメンデーションが更新されました",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "レコメンデーションの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  // レポートの生成と保存
  const generateReport = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${ideaId}/report`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("レポートの生成に失敗しました");
      const report = await response.json();

      // レポートをJSON形式でダウンロード
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-report-${ideaId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return report;
    },
    onSuccess: () => {
      toast({
        title: "レポート生成完了",
        description: "プロジェクトレポートがダウンロードされました",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "レポートの生成に失敗しました",
        variant: "destructive",
      });
    },
  });

  const priorityColors = {
    high: "text-red-500 bg-red-50",
    medium: "text-yellow-500 bg-yellow-50",
    low: "text-green-500 bg-green-50",
  };

  const categoryIcons = {
    market_research: BarChart,
    customer_development: Star,
    product_development: Brain,
    risk_mitigation: AlertTriangle,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AIレコメンデーション</CardTitle>
            <CardDescription>
              プロジェクトの進捗データに基づく推奨アクション
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updateRecommendations.mutate()}
              disabled={updateRecommendations.isPending}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  updateRecommendations.isPending ? "animate-spin" : ""
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => generateReport.mutate()}
              disabled={generateReport.isPending}
            >
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const CategoryIcon =
              categoryIcons[rec.category as keyof typeof categoryIcons];

            return (
              <div
                key={rec.id}
                className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {CategoryIcon && (
                      <CategoryIcon className="h-5 w-5 mt-1 text-muted-foreground" />
                    )}
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      priorityColors[rec.priority as keyof typeof priorityColors]
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>難易度: {rec.implementationDifficulty}</span>
                  <span>•</span>
                  <span>期待効果: {rec.expectedImpact}</span>
                </div>
              </div>
            );
          })}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>レコメンデーションはありません</p>
              <p className="text-sm">
                更新ボタンをクリックして新しいレコメンデーションを生成してください
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}