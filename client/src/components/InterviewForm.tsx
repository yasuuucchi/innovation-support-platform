import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Interview } from "@/types";

interface InterviewFormProps {
  ideaId: number;
  onSuccess: (interview: Interview) => void;
}

export default function InterviewForm({ ideaId, onSuccess }: InterviewFormProps) {
  const form = useForm({
    defaultValues: {
      content: "",
    },
  });

  const createInterview = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          content: data.content,
        }),
      });
      if (!response.ok) throw new Error("Failed to create interview");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "インタビュー結果を保存しました",
        description: "AIによる分析が完了しました",
      });
      form.reset();
      onSuccess(data);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "インタビュー結果の保存に失敗しました",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => createInterview.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>インタビュー内容</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="インタビューの内容を入力してください"
                  className="h-40"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createInterview.isPending}
        >
          {createInterview.isPending ? "分析中..." : "分析を開始"}
        </Button>
      </form>
    </Form>
  );
}
