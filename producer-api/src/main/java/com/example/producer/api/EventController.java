package com.example.producer.api;

import com.example.producer.api.dto.EventRequest;
import com.example.producer.kafka.EventProducer;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/events")
public class EventController {

  private final EventProducer producer;
  private final ObjectMapper mapper;

  @Value("${app.kafka.topics.events:events}")
  private String eventsTopic;

  public EventController(EventProducer producer, ObjectMapper mapper) {
    this.producer = producer;
    this.mapper = mapper;
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> publish(@Valid @RequestBody EventRequest req) throws Exception {
    String traceId = UUID.randomUUID().toString();
    MDC.put("trace_id", traceId);
    MDC.put("event_id", req.eventId());

    String json = mapper.writeValueAsString(req);
    producer.publish(eventsTopic, req.eventId(), json, traceId);

    MDC.clear();
    return ResponseEntity.accepted().body(Map.of(
        "status", "PUBLISHED",
        "event_id", req.eventId(),
        "trace_id", traceId
    ));
  }
}
