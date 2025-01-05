import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Hourglass
} from "lucide-react";
import type { ProjectRisk } from "@db/schema";

interface ProjectRisksProps {
  ideaId: number;
}

const severityIcons = {
  low: AlertCircle,
  medium: AlertTriangle,
  high: AlertOctagon,
};

const statusIcons = {
  pending: Clock,
  in_progress: Hourglass,
  mitigated: CheckCircle2,
};

const severityColors = {
  low: "text-yellow-500",
  medium: "text-orange-500",
  high: "text-red-500",
};

const statusColors = {
  pending: "text-gray-500",
  in_progress: "text-blue-500",
  mitigated: "text-green-500",
};

export default function ProjectRisks({ ideaId }: ProjectRisksProps) {
  const { data: risks = [] } = useQuery<ProjectRisk[]>({
    queryKey: [`/api/project-risks/${ideaId}`],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>リスク管理</CardTitle>
        <CardDescription>
          プロジェクトの潜在的なリスクと対策状況
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {risks.map((risk) => {
            const SeverityIcon = severityIcons[risk.severity as keyof typeof severityIcons];
            const StatusIcon = statusIcons[risk.mitigationStatus as keyof typeof statusIcons];

            return (
              <div
                key={risk.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <SeverityIcon
                      className={`h-5 w-5 mt-1 ${
                        severityColors[risk.severity as keyof typeof severityColors]
                      }`}
                    />
                    <div>
                      <h4 className="font-medium">{risk.riskType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {risk.description}
                      </p>
                    </div>
                  </div>
                  <StatusIcon
                    className={`h-5 w-5 ${
                      statusColors[risk.mitigationStatus as keyof typeof statusColors]
                    }`}
                  />
                </div>
              </div>
            );
          })}

          {risks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              リスクは登録されていません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
