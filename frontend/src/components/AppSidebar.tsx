import { Activity, Send, Table, AlertTriangle, Heart, LayoutDashboard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useSystemHealth } from "@/hooks/use-system-health";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Publish Event", url: "/publish", icon: Send },
  { title: "Events", url: "/events", icon: Table },
  { title: "Dead Letter Queue", url: "/dlq", icon: AlertTriangle },
  { title: "System Health", url: "/health", icon: Heart },
];

export function AppSidebar() {
  const { producer, consumer } = useSystemHealth();
  const producerUp = producer.data?.status === "UP";
  const consumerUp = consumer.data?.status === "UP";
  const allUp = producerUp && consumerUp;

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-5 py-4">
        <Activity className="h-6 w-6 text-primary" />
        <span className="text-sm font-bold tracking-wide text-sidebar-accent-foreground">
          Event Processor
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-primary font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
          System Status
        </p>
        <div className="space-y-1.5">
          <StatusDot label="Producer" up={producerUp} loading={producer.isLoading} />
          <StatusDot label="Consumer" up={consumerUp} loading={consumer.isLoading} />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${allUp ? "bg-success" : "bg-destructive"} ${
              producer.isLoading || consumer.isLoading ? "animate-pulse" : ""
            }`}
          />
          <span className="text-xs text-sidebar-muted">
            {producer.isLoading ? "Checking…" : allUp ? "All systems operational" : "Degraded"}
          </span>
        </div>
      </div>
    </aside>
  );
}

function StatusDot({ label, up, loading }: { label: string; up: boolean; loading: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${loading ? "animate-pulse bg-warning" : up ? "bg-success" : "bg-destructive"}`}
      />
      <span className="text-xs text-sidebar-foreground">{label}</span>
    </div>
  );
}
