import { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: settings } = useSettings();
  const calculateMutation = useCalculateTransaction();
  const [calcResult, setCalcResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0 },
  });

  // Real-time calculation debounce could be added, but manual trigger is safer for accuracy
  const handleCalculate = async (values: z.infer<typeof formSchema>) => {
    try {
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
          className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-border"
        >
          <CurrencyInput
            {...form.register("amount")}
            placeholder="500"
            label="Enter Amount"
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            className="w-full text-lg h-14 rounded-xl font-display shadow-lg shadow-primary/20"
            disabled={calculateMutation.isPending}
          >
            {calculateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-2" />
            )}
            Calculate Savings
          </Button>
        </form>

        {/* Results Area */}
        <AnimatePresence>
          {calcResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 shadow-xl shadow-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Droplets className="w-32 h-32" />
                </div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div className="text-primary-foreground/70 text-sm font-medium">Fuel Volume</div>
                    <div className="font-display text-2xl font-bold">{calcResult.liters} L</div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-primary-foreground/70 text-sm font-medium">Original Cost</div>
                    <div className="font-display text-xl font-semibold opacity-70 line-through">₹{calcResult.originalAmount}</div>
                  </div>

                  <div className="pt-2">
                    <div className="text-accent text-sm font-bold uppercase tracking-wider mb-1">Total Payable</div>
                    <div className="font-display text-5xl font-bold text-white tracking-tight">
                      ₹{calcResult.finalAmount}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3 flex items-center justify-between backdrop-blur-sm">
                    <span className="font-medium text-sm">You Save</span>
                    <span className="font-display font-bold text-xl text-accent">₹{calcResult.savings}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceed}
                size="lg"
                className="w-full h-16 text-xl rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-display shadow-xl shadow-accent/20 animate-pulse"
              >
                Proceed to Payment
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
