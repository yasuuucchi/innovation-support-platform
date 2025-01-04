import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Analysis } from "@/types";

interface MarketAnalysisProps {
  analysis: Analysis;
}

export default function MarketAnalysis({ analysis }: MarketAnalysisProps) {
  const marketData = [
    {
      name: "現在の市場規模",
      value: analysis.marketSize.current,
    },
    {
      name: "潜在市場規模",
      value: analysis.marketSize.potential,
    },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>市場規模分析</CardTitle>
          <CardDescription>
            現在と潜在的な市場規模の比較
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>市場成長性</CardTitle>
          <CardDescription>
            年間成長率（CAGR）: {analysis.marketSize.cagr}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">技術成熟度</h4>
              <p className="text-2xl font-bold">
                {analysis.technicalMaturity}/100
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">想定ユーザー数</h4>
              <p className="text-2xl font-bold">
                {(analysis.personaSize / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}