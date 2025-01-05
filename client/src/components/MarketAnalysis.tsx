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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Analysis } from "@db/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface MarketAnalysisProps {
  analysis: Analysis;
  ideaId: number;
}

interface ScoreDetail {
  subject: string;
  value: number;
}

export default function MarketAnalysis({ analysis, ideaId }: MarketAnalysisProps) {
  const queryClient = useQueryClient();

  // 市場分析更新のミューテーション
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
      queryClient.invalidateQueries({ queryKey: [`/api/analysis/${ideaId}`] });
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

  // トレンドデータの生成（デモ用）
  const trendData = [
    { date: "2024-01", interest: 65, mentions: 45, sentiment: 0.7 },
    { date: "2024-02", interest: 70, mentions: 52, sentiment: 0.65 },
    { date: "2024-03", interest: 85, mentions: 78, sentiment: 0.8 },
    { date: "2024-04", interest: 95, mentions: 89, sentiment: 0.85 },
    { date: "2024-05", interest: 88, mentions: 92, sentiment: 0.75 },
  ];

  return (
    <div className="space-y-6">
      {/* スコアカード */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>市場分析</CardTitle>
              <CardDescription>
                総合評価スコア: {analysis.ideaScore}/100点
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

      {/* 市場トレンド分析 */}
      <Card>
        <CardHeader>
          <CardTitle>市場トレンド分析</CardTitle>
          <CardDescription>
            検索トレンド・SNSメンション数・感情分析の推移
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="interest"
                  name="検索トレンド"
                  stroke="hsl(var(--primary))"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mentions"
                  name="SNSメンション数"
                  stroke="hsl(var(--secondary))"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sentiment"
                  name="感情分析スコア"
                  stroke="hsl(var(--accent))"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
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