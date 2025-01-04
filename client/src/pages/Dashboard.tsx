import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IdeaScoreCard from "@/components/IdeaScoreCard";
import MarketAnalysis from "@/components/MarketAnalysis";
import BehaviorTracker from "@/components/BehaviorTracker";
import type { Idea, Analysis, BehaviorLog, Interview } from "@/types";

export default function Dashboard() {
  const { id } = useParams();

  const { data: idea } = useQuery<Idea>({
    queryKey: [`/api/ideas/${id}`],
  });

  const { data: analysis } = useQuery<Analysis>({
    queryKey: [`/api/analysis/${id}`],
  });

  const { data: behaviorLogs } = useQuery<BehaviorLog[]>({
    queryKey: [`/api/behavior-logs/${id}`],
  });

  const { data: interviews } = useQuery<Interview[]>({
    queryKey: [`/api/interviews/${id}`],
  });

  if (!idea) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">{idea.name}</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Idea Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Target Customer
                </dt>
                <dd>{idea.targetCustomer}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Price Range
                </dt>
                <dd>{idea.priceRange}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Value Proposition
                </dt>
                <dd>{idea.value}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Competitors
                </dt>
                <dd>{idea.competitors}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {analysis && <IdeaScoreCard analysis={analysis} />}
      </div>

      <Tabs defaultValue="market" className="space-y-4">
        <TabsList>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Tracking</TabsTrigger>
        </TabsList>
        <TabsContent value="market">
          {analysis && <MarketAnalysis analysis={analysis} />}
        </TabsContent>
        <TabsContent value="behavior">
          {behaviorLogs && <BehaviorTracker logs={behaviorLogs} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
