import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from "recharts";
import type { Idea } from "@db/schema";
import { phases } from "./ProjectStatus";

interface ProjectHeatmapProps {
  ideas: Idea[];
}

export default function ProjectHeatmap({ ideas }: ProjectHeatmapProps) {
  // ヒートマップデータの生成
  const data = ideas.map((idea) => {
    const phaseIndex = phases.findIndex((p) => p.id === idea.currentPhase);
    const progress = idea.phaseProgress as Record<string, number>;
    const currentPhaseProgress = progress[idea.currentPhase] || 0;

    // 成功確率の計算（フェーズの進捗に基づく）
    const successProbability = Math.min(
      100,
      currentPhaseProgress + (phaseIndex * 10) // フェーズが進むごとに基礎確率が上がる
    );

    return {
      x: phaseIndex,
      y: successProbability,
      z: successProbability,
      name: idea.name,
      phase: phases[phaseIndex]?.name || "Unknown",
      progress: currentPhaseProgress,
    };
  });

  // カラースケールの生成
  const getColor = (value: number) => {
    if (value >= 80) return "#22C55E"; // 緑（高確率）
    if (value >= 60) return "#84CC16"; // 黄緑（やや高確率）
    if (value >= 40) return "#EAB308"; // 黄（中確率）
    if (value >= 20) return "#F97316"; // オレンジ（やや低確率）
    return "#EF4444"; // 赤（低確率）
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>プロジェクトヒートマップ</CardTitle>
        <CardDescription>
          フェーズと成功確率の分布
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
            >
              <XAxis
                dataKey="x"
                type="number"
                name="フェーズ"
                tickFormatter={(value) => phases[value]?.name.split("（")[0] || ""}
                domain={[0, phases.length - 1]}
                angle={-45}
                textAnchor="end"
                interval={0}
                tick={{ dy: 25 }}
              />
              <YAxis
                dataKey="y"
                type="number"
                name="成功確率"
                unit="%"
                domain={[0, 100]}
              />
              <ZAxis dataKey="z" range={[50, 500]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.phase}
                        </p>
                        <p className="text-sm">
                          進捗: {Math.round(data.progress)}%
                        </p>
                        <p className="text-sm">
                          成功確率: {Math.round(data.y)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={data} shape="circle">
                {data.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.y)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          {[
            { label: "高確率", color: "#22C55E" },
            { label: "やや高確率", color: "#84CC16" },
            { label: "中確率", color: "#EAB308" },
            { label: "やや低確率", color: "#F97316" },
            { label: "低確率", color: "#EF4444" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}