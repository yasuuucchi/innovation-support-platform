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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import type { Idea } from "@/types";

interface IdeaFormProps {
  onSuccess: (idea: Idea) => void;
}

export default function IdeaForm({ onSuccess }: IdeaFormProps) {
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
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("アイデアの作成に失敗しました");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "成功",
        description: "アイデアが作成されました",
      });
      onSuccess(data);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "アイデアの作成に失敗しました",
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
          {createIdea.isPending ? "作成中..." : "アイデアを作成"}
        </Button>
      </form>
    </Form>
  );
}