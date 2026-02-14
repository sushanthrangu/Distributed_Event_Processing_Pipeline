package com.example.consumer.observability;

import org.slf4j.MDC;

import java.util.UUID;

public final class LogContext {

  private static final String TRACE_ID = "trace_id";
  private static final String EVENT_ID = "event_id";

  private LogContext() {}

  public static String initTrace(String traceIdFromHeader) {
    String traceId = (traceIdFromHeader == null || traceIdFromHeader.isBlank())
        ? UUID.randomUUID().toString()
        : traceIdFromHeader;

    MDC.put(TRACE_ID, traceId);
    return traceId;
  }

  public static void setEventId(String eventId) {
    if (eventId != null) {
      MDC.put(EVENT_ID, eventId);
    }
  }

  public static void clear() {
    MDC.clear();
  }
}
