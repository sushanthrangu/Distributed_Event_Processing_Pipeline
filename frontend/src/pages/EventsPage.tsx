import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents, ProcessedEvent } from "@/api/events";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function EventsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["events", page, search, statusFilter],
    queryFn: () =>
      fetchEvents({
        page,
        size: 20,
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
    refetchInterval: 15000,
  });

  const events: ProcessedEvent[] = data?.content ?? (Array.isArray(data) ? data : []);
  const totalPages = data?.totalPages ?? 1;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="text-sm text-muted-foreground">Browse processed events</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by event ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PROCESSED">Processed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Event ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Processed At</th>
              <th className="px-4 py-3">Processing Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No events found
                </td>
              </tr>
            ) : (
              events.map((evt, i) => (
                <tr key={evt.eventId + i} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{evt.eventId}</td>
                  <td className="px-4 py-3">{evt.eventType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={evt.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.createdAt ? new Date(evt.createdAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.processedAt ? new Date(evt.processedAt).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{evt.processingTime != null ? `${evt.processingTime}ms` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    PROCESSED: "bg-success/10 text-success",
    FAILED: "bg-destructive/10 text-destructive",
    PENDING: "bg-warning/10 text-warning",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${classes[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
