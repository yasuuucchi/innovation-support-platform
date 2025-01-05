import { useQuery } from "@tanstack/react-query";
import { Idea } from "@db/schema";
import ProjectStatus from "./ProjectStatus";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const phases = [
  { id: "idea_exploration", name: "Idea Exploration（アイデア探索）" },
  { id: "customer_discovery", name: "Customer Discovery（顧客探索）" },
  { id: "customer_problem_fit", name: "Customer/Problem Fit（課題適合）" },
  { id: "problem_solution_fit", name: "Problem/Solution Fit（解決策適合）" },
  { id: "solution_product_fit", name: "Solution/Product Fit（製品実現性）" },
  { id: "product_market_fit", name: "Product/Market Fit（市場適合性）" },
  { id: "scale_up", name: "Scale-Up（スケールアップ）" }
];

export default function ProjectList() {
  const { data: ideas = [] } = useQuery<Idea[]>({
    queryKey: ["/api/ideas"],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<string>("");

  // フィルタリングされたプロジェクトリスト
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = selectedPhase ? idea.currentPhase === selectedPhase : true;
    return matchesSearch && matchesPhase;
  });

  // フェーズごとのプロジェクト数を計算
  const phaseStats = phases.map((phase) => ({
    ...phase,
    count: ideas.filter((idea) => idea.currentPhase === phase.id).length,
  }));

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">イノベーションプラットフォーム</h1>
          <p className="text-muted-foreground mt-2">
            全{ideas.length}プロジェクト
          </p>
        </div>
        <Button asChild>
          <Link href="/ideas/new">
            <Plus className="w-4 h-4 mr-2" />
            新規アイデア
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="プロジェクト名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={selectedPhase}
          onValueChange={setSelectedPhase}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="フェーズで絞り込み" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全てのフェーズ</SelectItem>
            {phaseStats.map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {phase.name} ({phase.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => (
          <Link key={idea.id} href={`/dashboard/${idea.id}`}>
            <ProjectStatus idea={idea} />
          </Link>
        ))}

        {filteredIdeas.length === 0 && (
          <div className="col-span-full text-center py-12 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              {ideas.length === 0 ? "プロジェクトがありません" : "該当するプロジェクトがありません"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {ideas.length === 0
                ? "新しいアイデアを追加して、イノベーションを始めましょう"
                : "検索条件を変更してみてください"}
            </p>
            {ideas.length === 0 && (
              <Button asChild>
                <Link href="/ideas/new">
                  <Plus className="w-4 h-4 mr-2" />
                  新規アイデア
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}