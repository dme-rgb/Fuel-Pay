import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { LockKeyhole, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <Layout showNav={false}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-sm mx-auto space-y-8 animate-enter px-4">
        <div className="bg-primary/5 p-6 rounded-full">
          <LockKeyhole className="w-12 h-12 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Admin Login</h1>
          <p className="text-muted-foreground w-full">
            Access the dashboard to manage fuel prices.
          </p>
        </div>

        {loginMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(loginMutation.error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-lg rounded-xl shadow-lg"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </Button>

        <div className="text-xs text-muted-foreground mt-8">
          Authorized personnel only.
        </div>
      </form>
    </Layout>
  );
}
