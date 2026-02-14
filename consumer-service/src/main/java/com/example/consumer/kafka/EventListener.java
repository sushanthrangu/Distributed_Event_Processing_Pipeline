package com.example.consumer.kafka;

import com.example.consumer.repo.EventRepository;
import com.example.consumer.service.EventProcessor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class EventListener {

  private final ObjectMapper mapper;
  private final EventProcessor processor;

  public EventListener(ObjectMapper mapper, EventProcessor processor) {
    this.mapper = mapper;
    this.processor = processor;
  }

  @KafkaListener(
      topics = "${app.kafka.topics.events}",
      containerFactory = "batchKafkaListenerContainerFactory"
  )
  public void onMessage(List<ConsumerRecord<String, String>> records, Acknowledgment ack) throws Exception {
    List<EventRepository.EventRow> rows = new ArrayList<>(records.size());

    for (var r : records) {
      String traceId = headerAsString(r, "trace_id");
      if (!traceId.isBlank()) MDC.put("trace_id", traceId);

      JsonNode node = mapper.readTree(r.value());
      JsonNode eventIdNode = node.get("eventId");
      JsonNode eventTypeNode = node.get("eventType");

      if (eventIdNode == null || eventTypeNode == null) {
        throw new IllegalArgumentException("Missing eventId or eventType");
      }

      String eventId = eventIdNode.asText();
      String eventType = eventTypeNode.asText();
      MDC.put("event_id", eventId);

      rows.add(new EventRepository.EventRow(eventId, eventType, r.value()));
    }

    processor.persistInChunks(rows);
    ack.acknowledge();
    MDC.clear();
  }

  private String headerAsString(ConsumerRecord<String, String> r, String key) {
    var h = r.headers().lastHeader(key);
    return h == null ? "" : new String(h.value(), StandardCharsets.UTF_8);
  }
}
