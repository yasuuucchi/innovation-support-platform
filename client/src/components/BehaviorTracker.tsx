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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { BehaviorLog } from "@/types";

interface BehaviorTrackerProps {
  logs: BehaviorLog[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function BehaviorTracker({ logs }: BehaviorTrackerProps) {
  // 日付ごとのイベント数を集計
  const eventCounts = logs.reduce((acc, log) => {
    const date = format(new Date(log.createdAt), "MM/dd");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // イベントタイプごとの集計
  const eventTypes = logs.reduce((acc, log) => {
    acc[log.eventType] = (acc[log.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(eventCounts).map(([date, count]) => ({
    date,
    events: count,
  }));

  const pieData = Object.entries(eventTypes).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ユーザー行動分析</CardTitle>
          <CardDescription>
            時系列でのユーザーアクション推移
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>イベント分布</CardTitle>
            <CardDescription>
              ユーザーアクションの種類別分布
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近のイベント</CardTitle>
            <CardDescription>
              直近のユーザーアクション履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-auto">
              {logs.slice(0, 10).map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-start py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{log.eventType}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "yyyy年MM月dd日 HH:mm", {
                        locale: ja,
                      })}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {JSON.stringify(log.eventData)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}