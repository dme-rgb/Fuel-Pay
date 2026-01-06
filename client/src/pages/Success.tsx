import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Home, Copy, Share2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Success() {
  const [, setLocation] = useLocation();
  const [txn, setTxn] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("txn_success");
    if (!stored) {
      setLocation("/");
      return;
    }
    setTxn(JSON.parse(stored));
  }, [setLocation]);

  const copyCode = () => {
    if (txn?.authCode) {
      navigator.clipboard.writeText(txn.authCode);
      toast({ title: "Copied!", description: "Auth code copied to clipboard." });
    }
  };

  if (!txn) return null;

  return (
    <Layout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-enter">
        
        {/* Animated Success Circle */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-accent rounded-full flex items-center justify-center shadow-xl shadow-accent/30 z-10 relative"
          >
            <Check className="w-12 h-12 text-accent-foreground stroke-[3]" />
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-accent rounded-full -z-0"
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary">Payment Successful!</h1>
          <p className="text-muted-foreground">Show this code to the attendant</p>
        </div>

        {/* Auth Code Ticket */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-white border-2 border-dashed border-primary/20 rounded-xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-2">Auth Code</div>
          <div 
            onClick={copyCode}
            className="text-4xl font-mono font-bold text-primary tracking-widest cursor-pointer hover:scale-105 transition-transform select-all"
          >
            {txn.authCode || "PENDING"}
          </div>
          
          <div className="mt-6 pt-4 border-t border-dashed border-border flex justify-between text-sm">
             <span className="text-muted-foreground">Amount Paid</span>
             <span className="font-bold text-primary">₹{txn.finalAmount}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
             <span className="text-muted-foreground">Date</span>
             <span className="font-medium">{format(new Date(), "dd MMM, HH:mm")}</span>
          </div>
        </motion.div>

        {/* Savings Badge */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-accent/10 text-accent-foreground px-4 py-2 rounded-full font-bold text-sm"
        >
          You saved ₹{txn.savings} on this fill!
        </motion.div>

        <div className="w-full pt-8 grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-xl" onClick={() => window.print()}>
            <Share2 className="w-4 h-4 mr-2" />
            Receipt
          </Button>
          <Button 
            className="h-12 rounded-xl shadow-lg font-display" 
            onClick={() => setLocation("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
