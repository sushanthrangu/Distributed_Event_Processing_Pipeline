import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDLQEvents, retryDLQEvent, DLQEvent } from "@/api/events";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react";

export default function DLQPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dlq"],
    queryFn: fetchDLQEvents,
    refetchInterval: 15000,
  });

  const retry = useMutation({
    mutationFn: retryDLQEvent,
    onSuccess: () => {
      toast({ title: "Retry queued" });
      queryClient.invalidateQueries({ queryKey: ["dlq"] });
    },
    onError: (err: Error) => {
      toast({ title: "Retry failed", description: err.message, variant: "destructive" });
    },
  });

  const events: DLQEvent[] = Array.isArray(data) ? data : [];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dead Letter Queue</h1>
        <p className="text-sm text-muted-foreground">Failed events awaiting review</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <AlertTriangle className="mb-3 h-10 w-10 opacity-40" />
          <p>No failed events in the DLQ</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Error Message</th>
                <th className="px-4 py-3">Retry Count</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt, i) => (
                <tr
                  key={evt.eventId + i}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                    evt.retryCount >= 3 ? "bg-destructive/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs">{evt.eventId}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-destructive">{evt.errorMessage}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      evt.retryCount >= 3 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                    }`}>
                      {evt.retryCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {evt.createdAt ? new Date(evt.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={retry.isPending}
                      onClick={() => retry.mutate(evt.eventId)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" /> Retry
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
