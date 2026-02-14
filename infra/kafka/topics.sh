#!/bin/bash

set -e

echo "Waiting for Kafka to be ready..."
sleep 10

BOOTSTRAP_SERVER=${KAFKA_BOOTSTRAP_SERVERS:-kafka:29092}

echo "Creating Kafka topics..."

kafka-topics --bootstrap-server $BOOTSTRAP_SERVER \
  --create --if-not-exists \
  --topic events \
  --partitions 3 \
  --replication-factor 1

kafka-topics --bootstrap-server $BOOTSTRAP_SERVER \
  --create --if-not-exists \
  --topic events.dlq \
  --partitions 1 \
  --replication-factor 1

echo "Topics created successfully!"

kafka-topics --bootstrap-server $BOOTSTRAP_SERVER --list

echo "Kafka topic initialization complete."
