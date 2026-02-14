import { HealthStatus } from "@/api/health";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Props {
  title: string;
  data?: HealthStatus;
  isLoading: boolean;
}

export function HealthCard({ title, data, isLoading }: Props) {
  const up = data?.status === "UP";

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : up ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
      </div>

      <div className="mt-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isLoading
              ? "bg-muted text-muted-foreground"
              : up
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
          }`}
        >
          {isLoading ? "Checking…" : data?.status ?? "UNKNOWN"}
        </span>
      </div>

      {data?.components && (
        <div className="mt-4 space-y-2">
          {Object.entries(data.components).map(([name, comp]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground capitalize">{name}</span>
              <span
                className={
                  comp.status === "UP" ? "text-success" : "text-destructive"
                }
              >
                {comp.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
