import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Idea } from "@db/schema";
import { AlertCircle, TrendingUp, Users, Target } from "lucide-react";

const phases = [
  { id: "idea_exploration", name: "Idea Exploration（アイデア探索）", color: "bg-blue-500" },
  { id: "customer_discovery", name: "Customer Discovery（顧客探索）", color: "bg-green-500" },
  { id: "customer_problem_fit", name: "Customer/Problem Fit（課題適合）", color: "bg-yellow-500" },
  { id: "problem_solution_fit", name: "Problem/Solution Fit（解決策適合）", color: "bg-orange-500" },
  { id: "solution_product_fit", name: "Solution/Product Fit（製品実現性）", color: "bg-red-500" },
  { id: "product_market_fit", name: "Product/Market Fit（市場適合性）", color: "bg-purple-500" },
  { id: "scale_up", name: "Scale-Up（スケールアップ）", color: "bg-pink-500" }
];

interface ProjectDashboardProps {
  ideas: Idea[];
}

export default function ProjectDashboard({ ideas }: ProjectDashboardProps) {
  // フェーズごとのプロジェクト数を計算
  const phaseStats = phases.map((phase) => ({
    ...phase,
    count: ideas.filter((idea) => idea.currentPhase === phase.id).length,
    progress: Math.round(
      (ideas
        .filter((idea) => idea.currentPhase === phase.id)
        .reduce((sum, idea) => sum + (idea.phaseProgress as any)[phase.id], 0) /
        Math.max(ideas.filter((idea) => idea.currentPhase === phase.id).length, 1)) * 100
    ),
  }));

  // 全体の進捗率を計算
  const totalProgress = Math.round(
    phases.reduce((sum, phase) => {
      const phaseIdeas = ideas.filter((idea) => idea.currentPhase === phase.id);
      return (
        sum +
        (phaseIdeas.reduce(
          (phaseSum, idea) => phaseSum + (idea.phaseProgress as any)[phase.id],
          0
        ) /
          Math.max(phaseIdeas.length, 1))
      );
    }, 0) / phases.length
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>全体の進捗状況</CardTitle>
          <CardDescription>
            全{ideas.length}プロジェクトの平均進捗率: {totalProgress}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase) => {
              const stat = phaseStats.find((s) => s.id === phase.id);
              if (!stat) return null;

              return (
                <div key={phase.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                      <span className="font-medium">{phase.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.count}個のプロジェクト
                    </div>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              インタビュー実施状況
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              497件
            </div>
            <p className="text-sm text-muted-foreground">
              前月比 +63%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              目標達成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              84%
            </div>
            <p className="text-sm text-muted-foreground">
              前月比 +6%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              成功率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              71%
            </div>
            <p className="text-sm text-muted-foreground">
              前月比 +6%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* リスクアラート */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-4" />
            検出されたリスク
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-yellow-800">
            <li className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              3つのプロジェクトで顧客インタビューの実施が遅れています
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              2つのプロジェクトで競合分析が不足しています
            </li>
            <li className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              1つのプロジェクトで市場規模の再評価が必要です
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}