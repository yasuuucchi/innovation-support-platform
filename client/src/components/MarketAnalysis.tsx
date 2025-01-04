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
      name: "Current Market",
      value: analysis.marketSize.current,
    },
    {
      name: "Potential Market",
      value: analysis.marketSize.potential,
    },
  ];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Size Analysis</CardTitle>
          <CardDescription>
            Current and potential market size comparison
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
          <CardTitle>Market Growth</CardTitle>
          <CardDescription>
            Compound Annual Growth Rate (CAGR): {analysis.marketSize.cagr}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Technical Maturity</h4>
              <p className="text-2xl font-bold">
                {analysis.technicalMaturity}/100
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Persona Size</h4>
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
