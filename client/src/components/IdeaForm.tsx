import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import type { Idea } from "@db/schema";
import { Loader2 } from "lucide-react";

interface IdeaFormProps {
  onSuccess: (idea: Idea) => void;
}

export default function IdeaForm({ onSuccess }: IdeaFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      targetCustomer: "",
      priceRange: "",
      value: "",
      competitors: "",
    },
  });

  const createIdea = useMutation({
    mutationFn: async (data: Partial<Idea>) => {
      if (!user) {
        throw new Error("ログインが必要です");
      }

      // 1. まずアイデアを作成
      const ideaResponse = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: user.id,
        }),
      });

      if (!ideaResponse.ok) {
        throw new Error("アイデアの作成に失敗しました");
      }

      const idea = await ideaResponse.json();

      // 2. 市場分析を実行
      const analysisResponse = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: idea.id,
          name: data.name,
          targetCustomer: data.targetCustomer,
          priceRange: data.priceRange,
          value: data.value,
          competitors: data.competitors,
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error("市場分析の実行に失敗しました");
      }

      const analysis = await analysisResponse.json();

      // アイデアと分析結果を返す
      return {
        ...idea,
        analysis,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "成功",
        description: "アイデアが作成され、市場分析が完了しました",
      });
      // キャッシュを更新
      queryClient.invalidateQueries({ queryKey: ["ideas"] });
      onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "アイデアの作成に失敗しました",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createIdea.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>アイデア名</FormLabel>
              <FormControl>
                <Input {...field} placeholder="アイデアの名前を入力してください" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetCustomer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ターゲット顧客</FormLabel>
              <FormControl>
                <Input {...field} placeholder="誰がターゲット顧客ですか？" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>価格帯</FormLabel>
              <FormControl>
                <Input {...field} placeholder="想定される価格帯は？" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>提供価値</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="どのような価値を提供しますか？"
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="competitors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>競合</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="競合となる企業・サービスは？"
                  className="h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createIdea.isPending}
        >
          {createIdea.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              作成中...
            </>
          ) : (
            "アイデアを作成"
          )}
        </Button>
      </form>
    </Form>
  );
}