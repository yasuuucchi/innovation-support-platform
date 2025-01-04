import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { BehaviorLog } from "@/types";

interface BehaviorTrackerProps {
  logs: BehaviorLog[];
}

export default function BehaviorTracker({ logs }: BehaviorTrackerProps) {
  const eventCounts = logs.reduce((acc, log) => {
    const date = format(new Date(log.createdAt), "MM/dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(eventCounts).map(([date, count]) => ({
    date,
    events: count,
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ユーザー行動分析</CardTitle>
          <CardDescription>
            ユーザーの操作と利用状況の推移
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="events"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近のイベント</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{log.eventType}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), "yyyy年MM月dd日", {
                      locale: ja,
                    })}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {JSON.stringify(log.eventData)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}