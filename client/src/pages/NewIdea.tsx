import { useState } from "react";
import { useLocation } from "wouter";
import IdeaForm from "@/components/IdeaForm";
import MarketAnalysis from "@/components/MarketAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Idea } from "@db/schema";

export default function NewIdea() {
  const [, setLocation] = useLocation();
  const [createdIdea, setCreatedIdea] = useState<Idea | null>(null);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {!createdIdea ? (
          <Card>
            <CardHeader>
              <CardTitle>新しいアイデアを登録</CardTitle>
            </CardHeader>
            <CardContent>
              <IdeaForm
                onSuccess={(idea) => {
                  setCreatedIdea(idea);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{createdIdea.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <MarketAnalysis analysis={createdIdea.analysis} />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setLocation("/ideas")}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                アイデア一覧へ戻る
              </button>
              <button
                onClick={() => setCreatedIdea(null)}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                新しいアイデアを登録
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
