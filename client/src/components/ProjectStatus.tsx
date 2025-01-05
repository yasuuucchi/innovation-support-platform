import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Idea } from "@db/schema";

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
  const currentPhaseIndex = phases.findIndex(p => p.id === idea.currentPhase);
  const progress = idea.phaseProgress as Record<string, number>;

  // 全体の進捗率を計算
  const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0) / phases.length;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
      <CardHeader>
        <CardTitle className="text-xl line-clamp-2">{idea.name}</CardTitle>
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
              <div className={`w-3 h-3 rounded-full ${phases[currentPhaseIndex].color}`} />
              <span className="font-medium">{phases[currentPhaseIndex].name}</span>
            </div>
            <Progress 
              value={progress[idea.currentPhase] || 0} 
              className={`h-2 ${phases[currentPhaseIndex].color.replace('bg-', 'bg-opacity-20')}`}
            />
          </div>

          {/* その他の情報 */}
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between mb-1">
              <span>ターゲット顧客:</span>
              <span>{idea.targetCustomer}</span>
            </div>
            <div className="flex justify-between">
              <span>価格帯:</span>
              <span>{idea.priceRange}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}