import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { BehaviorLog } from "@/types";

interface TrackEventParams {
  ideaId: number;
  eventType: string;
  eventData: Record<string, any>;
}

export function useBehaviorTracker(ideaId: number) {
  // 行動ログを取得するクエリ
  const { data: logs = [], refetch } = useQuery<BehaviorLog[]>({
    queryKey: [`/api/behavior-logs/${ideaId}`],
    staleTime: 1000 * 60, // 1分間キャッシュ
  });

  // 行動ログを記録するミューテーション
  const trackEvent = useMutation({
    mutationFn: async ({ eventType, eventData }: Omit<TrackEventParams, "ideaId">) => {
      const response = await fetch("/api/behavior-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          eventType,
          eventData,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("行動ログの記録に失敗しました");
      }

      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    logs,
    trackEvent: trackEvent.mutate,
    isTracking: trackEvent.isPending,
  };
}
