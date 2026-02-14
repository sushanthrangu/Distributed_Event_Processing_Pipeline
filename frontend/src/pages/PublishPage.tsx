import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { publishEvent, EventPayload } from "@/api/events";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, CheckCircle, Copy } from "lucide-react";

function uuid() {
  return "evt-" + crypto.randomUUID().slice(0, 8);
}

const defaultPayload = JSON.stringify({ userId: 1001, email: "test@example.com" }, null, 2);

export default function PublishPage() {
  const { toast } = useToast();
  const [eventId, setEventId] = useState(uuid);
  const [eventType, setEventType] = useState("USER_CREATED");
  const [payload, setPayload] = useState(defaultPayload);
  const [jsonError, setJsonError] = useState("");
  const [lastResponse, setLastResponse] = useState<Record<string, unknown> | null>(null);

  const mutation = useMutation({
    mutationFn: (event: EventPayload) => publishEvent(event),
    onSuccess: (data) => {
      setLastResponse(data);
      toast({ title: "Event published", description: `ID: ${eventId}` });
      setEventId(uuid());
    },
    onError: (err: Error) => {
      toast({ title: "Publish failed", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(payload);
      setJsonError("");
      mutation.mutate({ eventId, eventType, payload: parsed });
    } catch {
      setJsonError("Invalid JSON payload");
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Publish Event</h1>
        <p className="text-sm text-muted-foreground">Send a new event to the processing pipeline</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-6">
          <div>
            <Label htmlFor="eventId">Event ID</Label>
            <div className="mt-1 flex gap-2">
              <Input id="eventId" value={eventId} onChange={(e) => setEventId(e.target.value)} className="font-mono text-sm" />
              <Button type="button" variant="outline" size="icon" onClick={() => setEventId(uuid())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Input id="eventType" value={eventType} onChange={(e) => setEventType(e.target.value)} className="mt-1" placeholder="e.g. USER_CREATED" />
          </div>

          <div>
            <Label htmlFor="payload">Payload (JSON)</Label>
            <Textarea
              id="payload"
              value={payload}
              onChange={(e) => {
                setPayload(e.target.value);
                setJsonError("");
              }}
              rows={8}
              className="mt-1 font-mono text-sm"
            />
            {jsonError && <p className="mt-1 text-xs text-destructive">{jsonError}</p>}
          </div>

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Publish Event
          </Button>
        </form>

        {/* Response panel */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Last Response</h3>
          {lastResponse ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" /> Published successfully
              </div>
              <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs text-muted-foreground">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events published yet. Submit the form to see the response.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
