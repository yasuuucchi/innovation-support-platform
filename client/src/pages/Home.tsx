import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import IdeaForm from "@/components/IdeaForm";
import { useQuery } from "@tanstack/react-query";
import type { Idea } from "@/types";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const { data: ideas, isLoading } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">イノベーションプラットフォーム</h1>
        <Button
          onClick={() => setShowNewIdeaForm(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          新規アイデア
        </Button>
      </div>

      {showNewIdeaForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>新規アイデアの登録</CardTitle>
          </CardHeader>
          <CardContent>
            <IdeaForm
              onSuccess={(idea) => {
                setShowNewIdeaForm(false);
                setLocation(`/dashboard/${idea.id}`);
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p>読み込み中...</p>
        ) : (
          ideas?.map((idea) => (
            <Card
              key={idea.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/dashboard/${idea.id}`)}
            >
              <CardHeader>
                <CardTitle>{idea.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  ターゲット: {idea.targetCustomer}
                </p>
                <p className="text-sm text-muted-foreground">
                  価格帯: {idea.priceRange}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}