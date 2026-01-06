import { clsx } from "clsx";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  variant?: "default" | "primary" | "accent";
  className?: string;
}

export function StatCard({ label, value, subValue, variant = "default", className }: StatCardProps) {
  return (
    <div
      className={clsx(
        "p-5 rounded-2xl border shadow-sm transition-all duration-200",
        {
          "bg-white border-border text-foreground": variant === "default",
          "bg-primary border-primary text-primary-foreground": variant === "primary",
          "bg-accent border-accent text-accent-foreground shadow-accent/20 shadow-lg": variant === "accent",
        },
        className
      )}
    >
      <div className={clsx("text-sm font-medium mb-1", {
        "text-muted-foreground": variant === "default",
        "text-primary-foreground/70": variant === "primary",
        "text-accent-foreground/80": variant === "accent",
      })}>
        {label}
      </div>
      <div className="font-display font-bold text-2xl tracking-tight">
        {value}
      </div>
      {subValue && (
        <div className={clsx("text-xs mt-1 font-medium", {
          "text-muted-foreground": variant === "default",
          "text-primary-foreground/60": variant === "primary",
          "text-accent-foreground/70": variant === "accent",
        })}>
          {subValue}
        </div>
      )}
    </div>
  );
}
