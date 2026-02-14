import apiClient, { consumerClient } from "./client";

export interface EventPayload {
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface ProcessedEvent {
  id?: number;
  eventId: string;
  eventType: string;
  status: "PROCESSED" | "FAILED" | "PENDING";
  createdAt: string;
  processedAt?: string;
  processingTime?: number;
  payload?: Record<string, unknown>;
}

export interface DLQEvent {
  id?: number;
  eventId: string;
  errorMessage: string;
  retryCount: number;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface DashboardMetrics {
  totalProcessed: number;
  failedEvents: number;
  successRate: number;
  avgProcessingTime: number;
}

/**
 * PRODUCER → Publish event to Kafka
 */
export const publishEvent = async (event: EventPayload) => {
  const res = await apiClient.post("/events", event);
  return res.data;
};

/**
 * CONSUMER → Fetch processed events from DB
 */
export const fetchEvents = async (params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}) => {
  try {
    const res = await consumerClient.get("/events", { params });
    return res.data;
  } catch {
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

/**
 * CONSUMER → Fetch DLQ events
 */
export const fetchDLQEvents = async () => {
  try {
    const res = await consumerClient.get("/events/dlq");
    return res.data;
  } catch {
    return [];
  }
};

/**
 * CONSUMER → Retry DLQ event
 */
export const retryDLQEvent = async (eventId: string) => {
  const res = await consumerClient.post(`/events/dlq/${eventId}/retry`);
  return res.data;
};

/**
 * CONSUMER → Fetch dashboard metrics
 */
export const fetchMetrics = async (): Promise<DashboardMetrics> => {
  try {
    const res = await consumerClient.get("/events/metrics");
    return res.data;
  } catch {
    return {
      totalProcessed: 0,
      failedEvents: 0,
      successRate: 0,
      avgProcessingTime: 0,
    };
  }
};
