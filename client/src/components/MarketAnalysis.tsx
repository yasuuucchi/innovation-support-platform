import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Analysis } from "@db/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Users } from "lucide-react";

interface MarketAnalysisProps {
  analysis: Analysis;
}

interface ScoreDetail {
  subject: string;
  value: number;
}

export default function MarketAnalysis({ analysis }: MarketAnalysisProps) {
  // レーダーチャートのデータを整形
  const radarData: ScoreDetail[] = [
    {
      subject: "市場性",
      value: (analysis.scoreDetails as any).marketPotential || 0,
    },
    {
      subject: "競争優位性",
      value: (analysis.scoreDetails as any).competitiveAdvantage || 0,
    },
    {
      subject: "実現可能性",
      value: (analysis.scoreDetails as any).feasibility || 0,
    },
    {
      subject: "収益性",
      value: (analysis.scoreDetails as any).profitability || 0,
    },
    {
      subject: "革新性",
      value: (analysis.scoreDetails as any).innovation || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* スコアカード */}
      <Card>
        <CardHeader>
          <CardTitle>総合評価スコア</CardTitle>
          <CardDescription>
            {analysis.ideaScore}/100点
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="スコア"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 市場インサイト */}
      <Card>
        <CardHeader>
          <CardTitle>市場インサイト</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">市場規模</h4>
              <p className="text-sm text-muted-foreground">
                {(analysis.marketInsights as any).marketSize || ""}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">成長率</h4>
              <p className="text-sm text-muted-foreground">
                {(analysis.marketInsights as any).growthRate || ""}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">競合分析</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {((analysis.marketInsights as any).competitorAnalysis || []).map((point: string, index: number) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リスクとチャンス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              リスク要因
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2">
              {((analysis.marketInsights as any).risks || []).map((risk: string, index: number) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              市場機会
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-2">
              {((analysis.marketInsights as any).opportunities || []).map((opportunity: string, index: number) => (
                <li key={index}>{opportunity}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* レコメンデーション */}
      <Card>
        <CardHeader>
          <CardTitle>推奨アクション</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {(analysis.recommendations as string[] || []).map((recommendation: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{recommendation}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}