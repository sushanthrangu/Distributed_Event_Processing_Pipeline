package com.example.consumer.model;

import java.time.Instant;

public class EventEntity {

  private Long id;
  private String eventId;
  private String eventType;
  private String payload;
  private Instant receivedAt;
  private Instant processedAt;

  public EventEntity() {
  }

  public EventEntity(Long id,
                     String eventId,
                     String eventType,
                     String payload,
                     Instant receivedAt,
                     Instant processedAt) {
    this.id = id;
    this.eventId = eventId;
    this.eventType = eventType;
    this.payload = payload;
    this.receivedAt = receivedAt;
    this.processedAt = processedAt;
  }

  public Long getId() { return id; }
  public String getEventId() { return eventId; }
  public String getEventType() { return eventType; }
  public String getPayload() { return payload; }
  public Instant getReceivedAt() { return receivedAt; }
  public Instant getProcessedAt() { return processedAt; }

  public void setId(Long id) { this.id = id; }
  public void setEventId(String eventId) { this.eventId = eventId; }
  public void setEventType(String eventType) { this.eventType = eventType; }
  public void setPayload(String payload) { this.payload = payload; }
  public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
  public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
}
