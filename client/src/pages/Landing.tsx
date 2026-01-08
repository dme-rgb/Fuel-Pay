import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "@/components/Layout";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { useCalculateTransaction } from "@/hooks/use-transactions";
import { useSettings } from "@/hooks/use-settings";
import { Loader2, ArrowRight, Droplets, TrendingDown } from "lucide-react";
import { motion, AnimatePresence, useSpring, useTransform, animate } from "framer-motion";

function AmountDisplay({ target, start, onComplete }: { target: number, start: number, onComplete?: () => void }) {
  const [displayValue, setDisplayValue] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    
    // Show original amount first
    setDisplayValue(start);
    
    const timer = setTimeout(() => {
      const controls = animate(start, target, {
        duration: 2,
        ease: [0.34, 1.56, 0.64, 1], // Custom bouncy ease for smoother feel
        onUpdate: (value) => setDisplayValue(value),
        onComplete: () => {
          setHasAnimated(true);
          if (onComplete) onComplete();
        }
      });
      return () => controls.stop();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [target, start, onComplete, hasAnimated]);

  return <>₹{displayValue.toFixed(2)}</>;
}

const formSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: settings } = useSettings();
  const calculateMutation = useCalculateTransaction();
  const [calcResult, setCalcResult] = useState<any>(null);
  const [showSavings, setShowSavings] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0 },
  });

  // Real-time calculation debounce could be added, but manual trigger is safer for accuracy
  const handleCalculate = async (values: z.infer<typeof formSchema>) => {
    try {
      setShowSavings(false);
      const result = await calculateMutation.mutateAsync(values.amount);
      setCalcResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProceed = () => {
    if (calcResult) {
      localStorage.setItem("txn_pending", JSON.stringify(calcResult));
      const customer = localStorage.getItem("customer");
      if (customer) {
        setLocation("/payment");
      } else {
        setLocation("/customer-login");
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-enter">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display text-primary">
            Refuel & Save
          </h1>
          <p className="text-muted-foreground">
            Enter your fuel amount to calculate your exclusive discount.
          </p>
        </div>

        {/* Calculation Form */}
        <form 
          onSubmit={form.handleSubmit(handleCalculate)} 
          className="
            space-y-6 
            bg-gradient-to-br from-white via-white to-slate-100
            p-6 
            rounded-2xl 
            border border-white/40
            shadow-[0_10px_30px_rgba(0,0,0,0.12),_0_4px_10px_rgba(0,0,0,0.08)]
            hover:shadow-[0_16px_45px_rgba(0,0,0,0.18)]
            transition-all duration-300
          "
        >
          <p className="text-sm font-medium text-muted-foreground">Enter Amount</p>
          <div className="
            rounded-xl 
            bg-gradient-to-b from-slate-100 to-white
            shadow-inner 
            ring-1 ring-slate-200
          ">
            <CurrencyInput
              {...form.register("amount")}
              placeholder="500"
              
              autoFocus
              className="bg-transparent"
            />
          </div>

          <div className="flex gap-2">
            {[100, 200, 500].map((val) => (
              <Button
                key={val}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 
                h-11 
                rounded-xl 
                border border-slate-300
                bg-gradient-to-b from-white to-slate-100
                shadow-[0_4px_0_rgba(0,0,0,0.15)]
                hover:translate-y-[1px]
                hover:shadow-[0_2px_0_rgba(0,0,0,0.15)]
                active:translate-y-[2px]
                active:shadow-none
                transition-all
                font-display"
                onClick={() => {
                  const current = form.getValues("amount") || 0;
                  form.setValue("amount", Number(current) + val);
                  setCalcResult(null); // Clear previous calculation to hide discount
                }}
              >
                +{val}
              </Button>
            ))}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full 
            h-14 
            text-lg 
            rounded-xl 
            font-display
            bg-gradient-to-b from-primary to-primary/60
            shadow-[0_7px_0_rgba(0,0,0,0.25),_0_8px_30px_rgba(0,0,0,0.25)]
            hover:translate-y-[1px]
            hover:shadow-[0_6px_0_rgba(0,0,0,0.25),_0_10px_25px_rgba(0,0,0,0.25)]
            active:translate-y-[3px]
            active:shadow-none
            transition-all"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-2" />
            )}
            Get Discount
          </Button>
        </form>

        {/* Results Area */}
        <AnimatePresence>
          {calcResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 shadow-xl shadow-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Droplets className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  

                  <div className="flex justify-between items-end">
                    <div className="text-primary-foreground/70 text-sm font-medium">Original Cost</div>
                    <div className="font-display text-xl font-semibold opacity-70">₹{calcResult.originalAmount}</div>
                  </div>

                  <div className="pt-2">
                    <div className="text-accent text-sm font-bold uppercase tracking-wider mb-1">Total Payable</div>
                    <div className="font-display text-5xl font-bold text-white tracking-tight">
                      <AmountDisplay 
                        target={Number(calcResult.finalAmount)} 
                        start={Number(calcResult.originalAmount)} 
                        onComplete={() => setShowSavings(true)}
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showSavings && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="bg-white/10 rounded-lg p-3 flex items-center justify-between backdrop-blur-sm"
                      >
                        <span className="font-medium text-sm">You Save</span>
                        <span className="font-display font-bold text-xl text-accent">₹{calcResult.savings}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {showSavings && (
                <Button
                  onClick={handleProceed}
                  size="lg"
                  className="w-full h-16 text-xl rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-display shadow-xl shadow-accent/20 animate-pulse"
                >
                  Proceed to Payment
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
