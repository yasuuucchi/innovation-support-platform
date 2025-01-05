import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import ProjectList from "@/components/ProjectList";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NewIdea from "@/pages/NewIdea";
import ImportIdea from "@/pages/ImportIdea";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";

function App() {
  const { checkSession, isAuthenticated } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <Switch>
            <Route path="/" component={ProjectList} />
            <Route path="/projects" component={ProjectList} />
            <Route path="/dashboard/:id" component={Dashboard} />
            <Route path="/ideas/new" component={NewIdea} />
            <Route path="/ideas/import" component={ImportIdea} />
            <Route path="/settings">
              <h1 className="text-2xl font-bold">設定</h1>
              <p className="mt-4 text-muted-foreground">設定ページは準備中です。</p>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">ページが見つかりません</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;