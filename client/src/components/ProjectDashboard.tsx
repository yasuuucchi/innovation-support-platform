import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Idea } from "@db/schema";
import { AlertCircle, TrendingUp, Users, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const phases = [
  { id: "idea_exploration", name: "Idea Exploration（アイデア探索）", color: "#3B82F6" }, // blue-500
  { id: "customer_discovery", name: "Customer Discovery（顧客探索）", color: "#22C55E" }, // green-500
  { id: "customer_problem_fit", name: "Customer/Problem Fit（課題適合）", color: "#EAB308" }, // yellow-500
  { id: "problem_solution_fit", name: "Problem/Solution Fit（解決策適合）", color: "#F97316" }, // orange-500
  { id: "solution_product_fit", name: "Solution/Product Fit（製品実現性）", color: "#EF4444" }, // red-500
  { id: "product_market_fit", name: "Product/Market Fit（市場適合性）", color: "#A855F7" }, // purple-500
  { id: "scale_up", name: "Scale-Up（スケールアップ）", color: "#EC4899" } // pink-500
];

interface ProjectDashboardProps {
  ideas: Idea[];
}

export default function ProjectDashboard({ ideas }: ProjectDashboardProps) {
  // フェーズごとのプロジェクト数とプログレスを計算
  const phaseStats = phases.map((phase) => {
    const phaseIdeas = ideas.filter((idea) => idea.currentPhase === phase.id);
    const count = phaseIdeas.length;
    const progress = Math.round(
      (phaseIdeas.reduce(
        (sum, idea) => sum + ((idea.phaseProgress as any)[phase.id] || 0),
        0
      ) /
        Math.max(count, 1))
    );

    return {
      name: phase.name,
      progress: progress,
      count: count,
      color: phase.color
    };
  });

  // 全体の進捗率を計算
  const totalProgress = Math.round(
    phases.reduce((sum, phase) => {
      const phaseIdeas = ideas.filter((idea) => idea.currentPhase === phase.id);
      return (
        sum +
        (phaseIdeas.reduce(
          (phaseSum, idea) => phaseSum + ((idea.phaseProgress as any)[phase.id] || 0),
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
          <div className="w-full h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={phaseStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                style={{ fill: "var(--background)" }}
              >
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{ value: '進捗率 (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, '進捗率']}
                  labelFormatter={(label) => `${label} (${phaseStats.find(p => p.name === label)?.count}個のプロジェクト)`}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                  {phaseStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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