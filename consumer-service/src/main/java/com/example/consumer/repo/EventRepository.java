package com.example.consumer.repo;

import java.util.List;

public interface EventRepository {
  void insertBatchIgnoreDuplicates(List<EventRow> rows);

  record EventRow(String eventId, String eventType, String payloadJson) {}
}
