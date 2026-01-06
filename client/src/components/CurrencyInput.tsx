import { InputHTMLAttributes, forwardRef } from "react";
import { IndianRupee } from "lucide-react";
import { clsx } from "clsx";

interface CurrencyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-muted-foreground ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <IndianRupee className="w-6 h-6" />
          </div>
          <input
            ref={ref}
            type="number"
            className={clsx(
              "w-full bg-secondary/50 border-2 border-transparent",
              "rounded-2xl py-4 pl-12 pr-4",
              "text-3xl font-display font-bold text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5",
              "transition-all duration-200",
              className
            )}
            placeholder="0"
            {...props}
          />
        </div>
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";
