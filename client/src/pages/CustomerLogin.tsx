import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight } from "lucide-react";

export default function CustomerLogin() {
  const [, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const customer = await res.json();
      localStorage.setItem("customer", JSON.stringify(customer));
      setLocation("/payment");
    } catch (err) {
      toast({ title: "Login Failed", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto pt-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display text-primary">Identify Yourself</h1>
          <p className="text-muted-foreground">Enter your phone number to track your savings</p>
        </div>

        <Card className="p-6 shadow-xl border-border">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="tel" 
                  placeholder="9876543210" 
                  className="pl-10 h-12 text-lg"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-lg rounded-xl font-display shadow-lg shadow-primary/20">
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}