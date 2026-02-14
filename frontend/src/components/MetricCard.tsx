import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: "default" | "success" | "destructive" | "warning";
}

const variantClasses: Record<string, string> = {
  default: "border-border",
  success: "border-success/30",
  destructive: "border-destructive/30",
  warning: "border-warning/30",
};

const iconBg: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
};

export function MetricCard({ title, value, subtitle, icon, variant = "default" }: MetricCardProps) {
  return (
    <div
      className={`animate-fade-in rounded-lg border bg-card p-5 ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-md p-2 ${iconBg[variant]}`}>{icon}</div>
      </div>
    </div>
  );
}
