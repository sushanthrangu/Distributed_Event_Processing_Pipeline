package com.example.producer.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

@Service
public class EventProducer {

  private final KafkaTemplate<String, String> kafkaTemplate;

  public EventProducer(KafkaTemplate<String, String> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  public void publish(String topic, String eventId, String eventJson, String traceId) {
    var msg = MessageBuilder.withPayload(eventJson)
        .setHeader(KafkaHeaders.TOPIC, topic)
        .setHeader(KafkaHeaders.KEY, eventId)
        .setHeader("event_id", eventId)
        .setHeader("trace_id", traceId)
        .build();

    kafkaTemplate.send(msg);
  }
}
