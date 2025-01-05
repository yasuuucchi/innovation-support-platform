import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdeaScoreCard from "@/components/IdeaScoreCard";
import MarketAnalysis from "@/components/MarketAnalysis";
import BehaviorTracker from "@/components/BehaviorTracker";
import InterviewForm from "@/components/InterviewForm";
import InterviewResults from "@/components/InterviewResults";
import ProjectRisks from "@/components/ProjectRisks";
import type { Idea, Analysis, BehaviorLog, Interview } from "@db/schema";

export default function Dashboard() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // IDが存在しない場合のエラーハンドリング
  if (!id) return <div>アイデアが見つかりません</div>;

  const ideaId = parseInt(id);
  if (isNaN(ideaId)) return <div>無効なIDです</div>;

  const { data: idea } = useQuery<Idea>({
    queryKey: [`/api/ideas/${ideaId}`],
  });

  const { data: analysis } = useQuery<Analysis>({
    queryKey: [`/api/analysis/${ideaId}`],
  });

  const { data: behaviorLogs } = useQuery<BehaviorLog[]>({
    queryKey: [`/api/behavior-logs/${ideaId}`],
  });

  const { data: interviews } = useQuery<Interview[]>({
    queryKey: [`/api/interviews/${ideaId}`],
  });

  if (!idea) return <div>読み込み中...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">{idea.name}</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>アイデア概要</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  ターゲット顧客
                </dt>
                <dd>{idea.targetCustomer}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  価格帯
                </dt>
                <dd>{idea.priceRange}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  提供価値
                </dt>
                <dd>{idea.value}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  競合
                </dt>
                <dd>{idea.competitors}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {analysis && <IdeaScoreCard analysis={analysis} ideaId={ideaId} />}

        <ProjectRisks ideaId={ideaId} />
      </div>

      <Tabs defaultValue="market" className="space-y-4">
        <TabsList>
          <TabsTrigger value="market">市場分析</TabsTrigger>
          <TabsTrigger value="behavior">行動分析</TabsTrigger>
          <TabsTrigger value="interviews">インタビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="market">
          {analysis && <MarketAnalysis analysis={analysis} ideaId={ideaId} />}
        </TabsContent>
        <TabsContent value="behavior">
          {behaviorLogs && <BehaviorTracker logs={behaviorLogs} />}
        </TabsContent>
        <TabsContent value="interviews">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>新規インタビュー</CardTitle>
                <CardDescription>
                  インタビュー内容を入力すると、AIが自動で分析を行います
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewForm
                  ideaId={ideaId}
                  onSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: [`/api/interviews/${ideaId}`],
                    });
                  }}
                />
              </CardContent>
            </Card>

            {interviews && <InterviewResults interviews={interviews} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}