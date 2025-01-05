import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import ProjectList from "@/components/ProjectList";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import { Toaster } from "@/components/ui/toaster";

function App() {
  const { checkSession, isAuthenticated } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth" component={Auth} />
        <Route path="/">
          {isAuthenticated ? <ProjectList /> : <Auth />}
        </Route>
        <Route path="/dashboard/:id">
          {isAuthenticated ? <Dashboard /> : <Auth />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </div>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
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