import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useTransactions } from "@/hooks/use-transactions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings2, Save, History, Search } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsSchema = z.object({
  fuelPrice: z.coerce.number().min(0),
  discountPerLiter: z.coerce.number().min(0),
});

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: transactions, isLoading: txnsLoading } = useTransactions();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fuelPrice: 0,
      discountPerLiter: 0,
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (settings) {
      form.reset({
        fuelPrice: Number(settings.fuelPrice),
        discountPerLiter: Number(settings.discountPerLiter),
      });
    }
  }, [settings, form]);

  const onSaveSettings = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateSettings.mutateAsync({
        fuelPrice: String(values.fuelPrice),
        discountPerLiter: String(values.discountPerLiter),
      });
      toast({ title: "Settings Updated", description: "Prices updated successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
    }
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="space-y-8 animate-enter pb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
             <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
             <p className="text-muted-foreground text-sm">Manage prices and view history</p>
          </div>
        </div>

        {/* Pricing Config */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Fuel Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSaveSettings)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Price (₹)</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register("fuelPrice")} 
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-accent">Discount (₹)</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    {...form.register("discountPerLiter")} 
                    className="font-mono text-accent font-bold"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                Update Prices
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" />
              Recent Transactions
            </h2>
            <div className="relative w-32 md:w-48">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="h-8 pl-8 text-xs rounded-full" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Auth Code</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3 text-right">Method</th>
                    <th className="px-4 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {txnsLoading ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">Loading history...</td>
                    </tr>
                  ) : transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">No transactions yet</td>
                    </tr>
                  ) : (
                    transactions?.slice(0, 10).map((txn: any) => (
                      <tr key={txn.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium">{txn.authCode}</td>
                        <td className="px-4 py-3 font-semibold">₹{txn.finalAmount}</td>
                        <td className="px-4 py-3 text-right capitalize text-muted-foreground text-xs">{txn.paymentMethod?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {txn.createdAt ? format(new Date(txn.createdAt), "HH:mm") : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
