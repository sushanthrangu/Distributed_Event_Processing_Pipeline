import { useQuery } from "@tanstack/react-query";
import { fetchConsumerHealth, fetchProducerHealth } from "@/api/health";

export function useSystemHealth() {
  const producer = useQuery({
    queryKey: ["health", "producer"],
    queryFn: fetchProducerHealth,
    refetchInterval: 15000,
  });

  const consumer = useQuery({
    queryKey: ["health", "consumer"],
    queryFn: fetchConsumerHealth,
    refetchInterval: 15000,
  });

  return { producer, consumer };
}
