package com.example.consumer.repo;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JdbcEventRepository implements EventRepository {

  private final JdbcTemplate jdbc;

  public JdbcEventRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @Override
  public void insertBatchIgnoreDuplicates(List<EventRow> rows) {
    // Insert-only design: idempotency enforced by UNIQUE(event_id).
    String sql = """
      INSERT INTO events (event_id, event_type, payload, received_at, processed_at)
      VALUES (?, ?, CAST(? AS JSON), NOW(3), NOW(3))
      """;

    try {
      jdbc.batchUpdate(sql, rows, rows.size(), (ps, r) -> {
        ps.setString(1, r.eventId());
        ps.setString(2, r.eventType());
        ps.setString(3, r.payloadJson());
      });
    } catch (DuplicateKeyException dup) {
      // Batch may fail if any row duplicates.
      // Fallback to per-row to keep the batch moving.
      for (var r : rows) {
        try {
          jdbc.update(sql, r.eventId(), r.eventType(), r.payloadJson());
        } catch (DuplicateKeyException ignored) {
          // idempotent: already processed, safe to ignore
        }
      }
    }
  }
}
