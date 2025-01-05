import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Upload, FileText, Loader2 } from "lucide-react";

export default function IdeaImport() {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleTextSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "エラー",
        description: "テキストを入力してください",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/ideas/extract-from-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newIdea = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "成功",
        description: "アイデアを登録しました",
      });
      setLocation(`/dashboard/${newIdea.id}`);
    } catch (error: unknown) {
      toast({
        title: "エラー",
        description: `アイデアの登録に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "エラー",
        description: "PDFファイルを選択してください",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ideas/extract-from-pdf", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newIdea = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      toast({
        title: "成功",
        description: "アイデアを登録しました",
      });
      setLocation(`/dashboard/${newIdea.id}`);
    } catch (error: unknown) {
      toast({
        title: "エラー",
        description: `アイデアの登録に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>テキストからアイデアを登録</CardTitle>
          <CardDescription>
            アイデアの説明を入力してください。AIが自動で必要な情報を抽出します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="アイデアの説明を入力..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] mb-4"
          />
          <Button
            onClick={handleTextSubmit}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            テキストから登録
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDFからアイデアを登録</CardTitle>
          <CardDescription>
            PDFファイルをアップロードしてアイデアを登録できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="w-full"
            disabled={isProcessing}
            variant="outline"
          >
            <label>
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              PDFをアップロード
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}