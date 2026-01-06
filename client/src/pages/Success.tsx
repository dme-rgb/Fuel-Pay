import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Home, Copy, Share2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Success() {
  const [, setLocation] = useLocation();
  const [txn, setTxn] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [timer, setTimer] = useState(15);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("txn_success");
    if (!stored) {
      setLocation("/");
      return;
    }
    setTxn(JSON.parse(stored));

    // Animation disappears after 60s
    const animTimeout = setTimeout(() => setShowAnimation(false), 60000);

    // 15s timer for refresh button logic
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(animTimeout);
      clearInterval(interval);
    };
  }, [setLocation]);

  const handleRefresh = () => {
    if (attempts >= 1) {
      toast({
        title: "Re-initialize Process",
        description: "Please re-initialize the process with DEO and refresh the auth code.",
        variant: "destructive",
      });
    }
    setAttempts((prev) => prev + 1);
    setTimer(15);
    toast({ title: "Refreshing...", description: "Fetching new auth code..." });
    // In a real app, call API to get new OTP
  };

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
        <AnimatePresence>
          {showAnimation && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="relative"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

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
          
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-2 flex justify-between items-center">
            <span>Auth Code</span>
            {timer === 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                className="h-6 px-2 text-accent hover:text-accent/80 font-bold"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            )}
            {timer > 0 && (
              <span className="text-xs text-muted-foreground/50">Refresh in {timer}s</span>
            )}
          </div>
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
