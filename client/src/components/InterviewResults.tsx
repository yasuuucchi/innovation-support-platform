import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Interview } from "@/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface InterviewResultsProps {
  interviews: Interview[];
}

export default function InterviewResults({ interviews }: InterviewResultsProps) {
  return (
    <div className="space-y-6">
      {interviews.map((interview) => (
        <Card key={interview.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              インタビュー結果
              <Badge variant="secondary">
                満足度: {interview.satisfactionScore}/5
              </Badge>
            </CardTitle>
            <CardDescription>
              {format(new Date(interview.createdAt), "yyyy年MM月dd日 HH:mm", {
                locale: ja,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">インタビュー内容</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {interview.content}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">キーフレーズ</h4>
                <div className="flex flex-wrap gap-2">
                  {interview.keyPhrases.map((phrase, i) => (
                    <Badge key={i} variant="outline">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">良かった点</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {interview.sentiment.positive.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">改善点</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {interview.sentiment.negative.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}