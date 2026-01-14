import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Home, Copy, Share2, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Success() {
  const [, setLocation] = useLocation();
  const [txn, setTxn] = useState<any>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [timer, setTimer] = useState(15);
  const [attempts, setAttempts] = useState(0);
  const { toast } = useToast();

  const [polling, setPolling] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("txn_success");
    if (!stored) {
      setLocation("/");
      return;
    }
    const txnData = JSON.parse(stored);
    setTxn(txnData);
  }, [setLocation]);

  // Polling Effect - runs whenever txn.authCode is PENDING
  useEffect(() => {
    if (!txn || txn.authCode !== "PENDING") return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/transactions/${txn.id}/otp-poll`);
        const data = await res.json();

        if (data.authCode && data.authCode !== "PENDING") {
          setTxn((prev: any) => {
            const updated = { ...prev, authCode: data.authCode };
            localStorage.setItem("txn_success", JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [txn?.authCode, txn?.id]);

  useEffect(() => {
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
  }, []);

  const handleRefresh = async () => {
    if (attempts >= 2) {
      toast({
        title: "Re-initialize Process",
        description: "Maximum refresh attempts reached. Please re-initialize.",
        variant: "destructive",
      });
      return;
    }

    setAttempts((prev) => prev + 1);
    setTimer(15);
    toast({ title: "Refreshing...", description: "Resetting and fetching new auth code..." });

    if (txn) {
      try {
        await fetch(`/api/transactions/${txn.id}/reset`, { method: "POST" });
        setTxn((prev: any) => {
          const updated = { ...prev, authCode: "PENDING" };
          localStorage.setItem("txn_success", JSON.stringify(updated));
          return updated;
        });
      } catch (err) {
        console.error("Failed to reset transaction:", err);
        toast({ title: "Error", description: "Failed to reset. Try again.", variant: "destructive" });
      }
    }
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
            className="text-4xl font-mono font-bold text-primary tracking-widest cursor-pointer hover:scale-105 transition-transform select-all flex items-center justify-center gap-3"
          >
            {txn.authCode === "PENDING" ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-2xl animate-pulse text-accent">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  WAITING...
                </div>
                <div className="text-xs font-sans font-normal text-muted-foreground animate-bounce">
                  Syncing with station...
                </div>
              </div>
            ) : (
              txn.authCode
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Amount</span>
              <span className="font-medium text-primary opacity-50">₹{txn.originalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-accent font-medium">Discount</span>
              <span className="font-bold text-accent">- ₹{txn.savings}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Convenience Fee</span>
              <span className="flex items-center gap-2">
                <span className="font-medium text-gray-400 line-through">
                  ₹5.00
                </span>
                <span className="font-medium text-primary">
                  ₹0.00
                </span>
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border/50">
              <span className="font-bold text-primary">Total Paid</span>
              <span className="font-bold text-primary">₹{txn.finalAmount}</span>
            </div>
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
          className="bg-accent/10 text-green-600 px-4 py-2 rounded-full font-bold text-sm"
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
            onClick={() => setLocation("/dashboard")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
