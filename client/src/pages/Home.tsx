import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { useTransactions } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, Wallet, PiggyBank, History, Fuel } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: transactions } = useTransactions();

  const totalSavings = transactions?.reduce((acc, txn) => acc + Number(txn.savings), 0) || 0;
  const totalSpent = transactions?.reduce((acc, txn) => acc + Number(txn.finalAmount), 0) || 0;

  return (
    <Layout>
      <div className="space-y-8 animate-enter">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-display text-primary">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Your fuel spending and savings overview</p>
          </div>
          <Button 
            size="lg" 
            className="rounded-xl shadow-lg shadow-primary/20 font-display"
            onClick={() => setLocation("/")}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Fuel
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Total Spent"
            value={`₹${totalSpent.toFixed(2)}`}
            variant="default"
          />
          <StatCard
            label="Total Savings"
            value={`₹${totalSavings.toFixed(2)}`}
            variant="accent"
          />
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-primary flex items-center">
              <History className="w-5 h-5 mr-2" />
              Recent History
            </h2>
          </div>

          <div className="space-y-3">
            {transactions?.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
                <Fuel className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <Button 
                  variant="ghost" 
                  className="text-accent hover:bg-accent/10"
                  onClick={() => setLocation("/")}
                >
                  Start your first fill
                </Button>
              </div>
            ) : (
              transactions?.slice(0, 5).map((txn, idx) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/50 rounded-full flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-primary">₹{txn.finalAmount}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(txn.createdAt!), "dd MMM, HH:mm")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-bold text-sm">Saved ₹{txn.savings}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {txn.paymentMethod}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
