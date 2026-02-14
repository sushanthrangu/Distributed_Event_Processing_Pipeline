import { consumerClient, apiClient } from "./client";

export interface HealthStatus {
  status: "UP" | "DOWN" | "UNKNOWN";
  components?: Record<string, { status: string; details?: Record<string, unknown> }>;
}

export const fetchConsumerHealth = async (): Promise<HealthStatus> => {
  try {
    const res = await consumerClient.get("/actuator/health");
    return res.data;
  } catch (e) {
    console.error("Consumer health failed:", e);
    return { status: "DOWN" };
  }
};


export const fetchProducerHealth = async (): Promise<HealthStatus> => {
  try {
    const res = await apiClient.get("/actuator/health");
    return res.data;
  } catch {
    return { status: "DOWN" };
  }
};
