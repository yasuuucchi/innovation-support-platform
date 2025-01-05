import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Idea } from "@db/schema";
import { AlertCircle, TrendingUp, Users, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Phase {
  id: string;
  name: string;
  color: string;
}

const phases: Phase[] = [
  { id: "idea_exploration", name: "Idea Exploration（アイデア探索）", color: "bg-blue-500" },
  { id: "customer_discovery", name: "Customer Discovery（顧客探索）", color: "bg-green-500" },
  { id: "customer_problem_fit", name: "Customer/Problem Fit（課題適合）", color: "bg-yellow-500" },
  { id: "problem_solution_fit", name: "Problem/Solution Fit（解決策適合）", color: "bg-orange-500" },
  { id: "solution_product_fit", name: "Solution/Product Fit（製品実現性）", color: "bg-red-500" },
  { id: "product_market_fit", name: "Product/Market Fit（市場適合性）", color: "bg-purple-500" },
  { id: "scale_up", name: "Scale-Up（スケールアップ）", color: "bg-pink-500" }
];

interface ProjectStatusProps {
  idea: Idea;
}

export default function ProjectStatus({ idea }: ProjectStatusProps) {
  const queryClient = useQueryClient();
  const currentPhaseIndex = phases.findIndex(p => p.id === idea.currentPhase);
  const currentPhase = phases[currentPhaseIndex] || phases[0]; // フォールバック用のデフォルトフェーズ
  const progress = idea.phaseProgress as Record<string, number>;

  // 全体の進捗率を計算
  const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0) / phases.length;

  // フェーズ更新のミューテーション
  const updatePhase = useMutation({
    mutationFn: async (newPhase: string) => {
      const response = await fetch(`/api/ideas/${idea.id}/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phase: newPhase }),
      });
      if (!response.ok) throw new Error("フェーズの更新に失敗しました");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "更新完了",
        description: "プロジェクトフェーズが更新されました",
      });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "フェーズの更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  // 市場分析の更新ミューテーション
  const updateAnalysis = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ideas/${idea.id}/analyze`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("市場分析の更新に失敗しました");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/analysis/${idea.id}`] });
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

  // ダミーのKPIデータ（実際のアプリケーションでは実データを使用）
  const kpiData = {
    interviews: Math.floor(Math.random() * 100),
    successRate: Math.floor(Math.random() * 100),
    risk: Math.random() > 0.7,
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl line-clamp-2">{idea.name}</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault(); // Linkコンポーネントのナビゲーションを防止
              updateAnalysis.mutate();
            }}
            disabled={updateAnalysis.isPending}
          >
            <RefreshCw className={`h-4 w-4 ${updateAnalysis.isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 全体の進捗バー */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>全体の進捗</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          {/* 現在のフェーズ */}
          <div className="p-4 rounded-lg border transition-colors border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${currentPhase.color}`} />
              <Select
                value={idea.currentPhase}
                onValueChange={(value) => {
                  updatePhase.mutate(value);
                }}
                disabled={updatePhase.isPending}
              >
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="フェーズを選択" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Progress 
              value={progress[idea.currentPhase] || 0} 
              className={`h-2 ${currentPhase.color.replace('bg-', 'bg-opacity-20')}`}
            />
          </div>

          {/* KPIと進捗指標 */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-muted rounded flex items-center gap-2">
              <Users className="h-4 w-4"/>
              <div className="text-muted-foreground">インタビュー</div>
              <div className="font-medium">{kpiData.interviews}件</div>
            </div>
            <div className="p-2 bg-muted rounded flex items-center gap-2">
              <TrendingUp className="h-4 w-4"/>
              <div className="text-muted-foreground">成功率</div>
              <div className="font-medium">{kpiData.successRate}%</div>
            </div>
          </div>

          {/* リスクアラート */}
          {kpiData.risk && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>リスク要因が検出されました</span>
            </div>
          )}

          {/* その他の情報 */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <div className="flex justify-between mb-1">
              <span>ターゲット顧客:</span>
              <span className="truncate ml-2">{idea.targetCustomer}</span>
            </div>
            <div className="flex justify-between">
              <span>価格帯:</span>
              <span className="truncate ml-2">{idea.priceRange}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}