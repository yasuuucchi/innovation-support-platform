import { useQuery } from "@tanstack/react-query";
import { Idea } from "@db/schema";
import ProjectStatus from "./ProjectStatus";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function ProjectList() {
  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">イノベーションプラットフォーム</h1>
        <Button asChild>
          <Link href="/ideas/new">
            <Plus className="w-4 h-4 mr-2" />
            新規アイデア
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {ideas.map((idea) => (
          <Link key={idea.id} href={`/ideas/${idea.id}`}>
            <a className="block transition-transform hover:-translate-y-1">
              <ProjectStatus idea={idea} />
            </a>
          </Link>
        ))}

        {ideas.length === 0 && (
          <div className="text-center py-12 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">プロジェクトがありません</h3>
            <p className="text-muted-foreground mb-4">
              新しいアイデアを追加して、イノベーションを始めましょう
            </p>
            <Button asChild>
              <Link href="/ideas/new">
                <Plus className="w-4 h-4 mr-2" />
                新規アイデア
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
