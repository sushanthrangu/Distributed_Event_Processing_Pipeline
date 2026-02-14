package com.example.consumer.kafka;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class DlqPublisher {

  private final KafkaTemplate<String, String> kafkaTemplate;

  @Value("${app.kafka.topics.dlq}")
  private String dlqTopic;

  public DlqPublisher(KafkaTemplate<String, String> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  public void publish(String key, String payload, String errorMessage) {
    ProducerRecord<String, String> record =
        new ProducerRecord<>(dlqTopic, key, payload);

    // Add error metadata header
    record.headers().add("error_message", errorMessage.getBytes());

    kafkaTemplate.send(record);
  }
}
