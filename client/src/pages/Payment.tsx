import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector, type PaymentMethod } from "@/components/PaymentMethodSelector";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Payment() {
  const [location, setLocation] = useLocation();
  const [details, setDetails] = useState<any>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const { toast } = useToast();
  
  const createMutation = useCreateTransaction();

  useEffect(() => {
    const stored = localStorage.getItem("txn_pending");
    if (!stored) {
      setLocation("/");
      return;
    }
    setDetails(JSON.parse(stored));
  }, [setLocation]);

  const handlePayment = async () => {
    if (!method || !details) return;

    try {
      const customer = JSON.parse(localStorage.getItem("customer") || "{}");
      const txn = await createMutation.mutateAsync({
        originalAmount: details.originalAmount,
        discountAmount: details.discountAmount,
        finalAmount: details.finalAmount,
        savings: details.savings,
        paymentMethod: method,
        customerId: customer.id,
      });
      
      localStorage.removeItem("txn_pending");
      // Pass the created transaction object to success page
      localStorage.setItem("txn_success", JSON.stringify(txn));
      setLocation("/success");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!details) return null;

  return (
    <Layout>
      <div className="space-y-6 animate-enter">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="pl-0 hover:bg-transparent hover:text-primary -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculation
        </Button>

        <div>
          <h1 className="text-2xl font-bold font-display text-primary">Payment Details</h1>
          <p className="text-muted-foreground text-sm">Choose a payment method to complete transaction.</p>
        </div>

        {/* Summary Card */}
        <div className="bg-secondary/30 rounded-2xl p-6 border border-border space-y-4">
          <div className="flex justify-between items-center text-sm">
             <span className="text-muted-foreground">Original Amount</span>
             <span className="font-semibold line-through decoration-destructive/50">₹{details.originalAmount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
             <span className="text-accent font-medium">Total Discount</span>
             <span className="font-bold text-accent">- ₹{details.savings}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
             <span className="text-muted-foreground">Convenience Fee</span>
             <span className="font-semibold text-primary">₹0.00</span>
          </div>
          <div className="border-t border-border/50 pt-4 flex justify-between items-center">
             <span className="font-bold text-lg">To Pay</span>
             <span className="font-display font-bold text-3xl text-primary">₹{details.finalAmount}</span>
          </div>
        </div>

        {/* Method Selection */}
        <div className="space-y-3">
           <label className="text-sm font-medium text-muted-foreground">Select Payment Method</label>
           <PaymentMethodSelector selected={method} onSelect={setMethod} />
        </div>

        {/* Secure Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
           <ShieldCheck className="w-4 h-4 text-accent" />
           <span>Secure SSL Encryption</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={!method || createMutation.isPending}
          className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 font-display"
          size="lg"
        >
          {createMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mr-2" />
          )}
          {createMutation.isPending ? "Processing..." : `Pay ₹${details.finalAmount}`}
        </Button>
      </div>
    </Layout>
  );
}
