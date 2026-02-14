import { useSystemHealth } from "@/hooks/use-system-health";
import { DashboardLayout } from "@/components/DashboardLayout";
import { HealthCard } from "@/components/HealthCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function HealthPage() {
  const { producer, consumer } = useSystemHealth();

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Health</h1>
          <p className="text-sm text-muted-foreground">Real-time health monitoring</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            producer.refetch();
            consumer.refetch();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HealthCard title="Producer API (Port 8080)" data={producer.data} isLoading={producer.isLoading} />
        <HealthCard title="Consumer Service (Port 8081)" data={consumer.data} isLoading={consumer.isLoading} />
      </div>

      <div className="mt-6 rounded-lg border bg-card p-5">
        <h3 className="mb-2 text-sm font-semibold text-card-foreground">External Tools</h3>
        <p className="text-sm text-muted-foreground">
          Kafka UI is available at{" "}
          <a
            href="http://localhost:8090"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            http://localhost:8090
          </a>
        </p>
      </div>
    </DashboardLayout>
  );
}
