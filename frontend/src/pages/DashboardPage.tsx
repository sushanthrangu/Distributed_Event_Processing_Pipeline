import { useQuery } from "@tanstack/react-query";
import { fetchMetrics } from "@/api/events";
import { useSystemHealth } from "@/hooks/use-system-health";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MetricCard } from "@/components/MetricCard";
import { HealthCard } from "@/components/HealthCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 10000,
  });

  const { producer, consumer } = useSystemHealth();

  const m = metrics ?? { totalProcessed: 0, failedEvents: 0, successRate: 0, avgProcessingTime: 0 };

  const pieData = [
    { name: "Success", value: m.totalProcessed - m.failedEvents },
    { name: "Failed", value: m.failedEvents },
  ];
  const COLORS = ["hsl(142, 71%, 45%)", "hsl(0, 72%, 51%)"];

  const barData = [
    { name: "Processed", value: m.totalProcessed },
    { name: "Failed", value: m.failedEvents },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Event processing system overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Processed"
          value={isLoading ? "—" : m.totalProcessed.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Failed Events"
          value={isLoading ? "—" : m.failedEvents.toLocaleString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="destructive"
        />
        <MetricCard
          title="Success Rate"
          value={isLoading ? "—" : `${m.successRate.toFixed(1)}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
        />
        <MetricCard
          title="Avg Processing Time"
          value={isLoading ? "—" : `${m.avgProcessingTime.toFixed(0)}ms`}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      {/* Charts + Health */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Event Processing</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 20%, 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 25%, 10%)",
                  border: "1px solid hsl(222, 20%, 18%)",
                  borderRadius: 8,
                  color: "hsl(210, 20%, 92%)",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i] || COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Success vs Failed</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 25%, 10%)",
                  border: "1px solid hsl(222, 20%, 18%)",
                  borderRadius: 8,
                  color: "hsl(210, 20%, 92%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> Success
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" /> Failed
            </span>
          </div>
        </div>
      </div>

      {/* Health */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HealthCard title="Producer API" data={producer.data} isLoading={producer.isLoading} />
        <HealthCard title="Consumer Service" data={consumer.data} isLoading={consumer.isLoading} />
      </div>
    </DashboardLayout>
  );
}
