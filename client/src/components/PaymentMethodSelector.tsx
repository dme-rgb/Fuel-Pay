import { clsx } from "clsx";
import { CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export type PaymentMethod = "cash" | "card" | "upi" | "net_banking";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const methods: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "net_banking", label: "Net Bank", icon: Building2 },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;
        
        return (
          <motion.button
            key={method.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(method.id)}
            className={clsx(
              "relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 text-primary shadow-md"
                : "border-border bg-white hover:border-primary/30 hover:bg-secondary/50 text-muted-foreground"
            )}
          >
            <div className={clsx(
              "p-3 rounded-full transition-colors",
              isSelected ? "bg-primary text-white" : "bg-secondary text-foreground"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm">{method.label}</span>
            
            {isSelected && (
              <motion.div
                layoutId="check"
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
