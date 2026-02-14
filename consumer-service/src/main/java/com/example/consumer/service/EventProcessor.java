package com.example.consumer.service;

import com.example.consumer.repo.EventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventProcessor {

  private final EventRepository repo;
  private final int batchSize;

  public EventProcessor(EventRepository repo,
                        @Value("${app.persistence.batch-size:200}") int batchSize) {
    this.repo = repo;
    this.batchSize = batchSize;
  }

  public void persistInChunks(List<EventRepository.EventRow> rows) {
    if (rows.isEmpty()) return;

    for (int i = 0; i < rows.size(); i += batchSize) {
      int end = Math.min(i + batchSize, rows.size());
      List<EventRepository.EventRow> chunk = new ArrayList<>(rows.subList(i, end));
      repo.insertBatchIgnoreDuplicates(chunk);
    }
  }
}
