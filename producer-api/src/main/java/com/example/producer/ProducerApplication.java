package com.example.producer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Producer API Application
 * 
 * REST API service that accepts event submissions and publishes them to Kafka.
 * 
 * Features:
 * - REST endpoints for event submission
 * - Kafka producer with reliability guarantees
 * - Request validation
 * - Structured logging
 * - Health checks and metrics
 * 
 * @author Your Name
 * @version 1.0.0
 */
@SpringBootApplication
@EnableKafka
public class ProducerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProducerApplication.class, args);
    }
}