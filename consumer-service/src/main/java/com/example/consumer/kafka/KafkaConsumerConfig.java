package com.example.consumer.kafka;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.TopicPartition;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaConsumerConfig {

  @Value("${app.kafka.topics.dlq}")
  private String dlqTopic;

  @Value("${app.processing.max-retries:3}")
  private int maxRetries;

  @Bean
  public ConcurrentKafkaListenerContainerFactory<String, String> batchKafkaListenerContainerFactory(
      ConsumerFactory<String, String> consumerFactory,
      DefaultErrorHandler errorHandler
  ) {
    var factory = new ConcurrentKafkaListenerContainerFactory<String, String>();
    factory.setConsumerFactory(consumerFactory);
    factory.setBatchListener(true);
    factory.setConcurrency(3);
    factory.setCommonErrorHandler(errorHandler);
    return factory;
  }

  @Bean
  public DefaultErrorHandler errorHandler(KafkaTemplate<String, String> kafkaTemplate) {
    var recoverer = new DeadLetterPublishingRecoverer(
        kafkaTemplate,
        (ConsumerRecord<?, ?> record, Exception ex) ->
            new TopicPartition(dlqTopic, record.partition())
    );

    long retries = Math.max(0, maxRetries - 1);
    var backoff = new FixedBackOff(500L, retries);

    return new DefaultErrorHandler(recoverer, backoff);
  }
}
