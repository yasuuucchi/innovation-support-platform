import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Idea } from "@db/schema";

interface Phase {
  id: string;
  name: string;
  color: string;
}

const phases: Phase[] = [
  { id: "idea_exploration", name: "アイデア探索", color: "bg-blue-500" },
  { id: "customer_discovery", name: "顧客探索", color: "bg-green-500" },
  { id: "customer_problem_fit", name: "課題適合", color: "bg-yellow-500" },
  { id: "problem_solution_fit", name: "解決策適合", color: "bg-orange-500" },
  { id: "solution_product_fit", name: "製品実現性", color: "bg-red-500" },
  { id: "product_market_fit", name: "市場適合性", color: "bg-purple-500" },
  { id: "scale_up", name: "スケールアップ", color: "bg-pink-500" }
];

interface ProjectStatusProps {
  idea: Idea;
}

export default function ProjectStatus({ idea }: ProjectStatusProps) {
  const currentPhaseIndex = phases.findIndex(p => p.id === idea.currentPhase);
  const progress = idea.phaseProgress as Record<string, number>;
  
  // 全体の進捗率を計算
  const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0) / phases.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>プロジェクト進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 全体の進捗バー */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>全体の進捗</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} />
            </div>

            {/* フェーズ別の進捗状況 */}
            <div className="space-y-3">
              {phases.map((phase, index) => {
                const isCurrentPhase = index === currentPhaseIndex;
                const phaseProgress = progress[phase.id] || 0;

                return (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-lg border ${
                      isCurrentPhase ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                        <span className="font-medium">{phase.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {phaseProgress}%
                      </span>
                    </div>
                    <Progress value={phaseProgress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
