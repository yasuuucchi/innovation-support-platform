import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
            <Accordion type="single" collapsible>
              <AccordionItem value="content">
                <AccordionTrigger>インタビュー内容</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {interview.content}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="insights">
                <AccordionTrigger>主要なインサイト</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="market">
                <AccordionTrigger>市場インサイト</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">ユーザーニーズ</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.marketInsights?.userNeeds.map((need, i) => (
                          <li key={i}>{need}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">差別化ポイント</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.marketInsights?.differentiators.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">市場機会</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.marketInsights?.opportunities.map((opp, i) => (
                          <li key={i}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="actions">
                <AccordionTrigger>アクションプラン</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">短期施策（1-2週間）</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.actionPlans?.shortTerm.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">中期施策（1-3ヶ月）</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.actionPlans?.midTerm.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">長期戦略（3ヶ月以上）</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {interview.actionPlans?.longTerm.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="next">
                <AccordionTrigger>優先アクション</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {interview.nextActions?.map((action, i) => (
                      <div key={i} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{action}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}