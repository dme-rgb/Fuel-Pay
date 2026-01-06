import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { LockKeyhole } from "lucide-react";

export default function Login() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <Layout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-enter">
        <div className="bg-primary/5 p-6 rounded-full">
           <LockKeyhole className="w-12 h-12 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Admin Login</h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Access the dashboard to manage fuel prices and view transaction history.
          </p>
        </div>

        <Button 
          onClick={handleLogin} 
          size="lg" 
          className="w-full max-w-xs h-12 text-lg rounded-xl shadow-lg"
        >
          Login with Replit
        </Button>
        
        <div className="text-xs text-muted-foreground mt-8">
          Authorized personnel only.
        </div>
      </div>
    </Layout>
  );
}
