# Distributed Event Processing Pipeline (Spring Boot + Kafka + MySQL)

Production-style event pipeline built for backend portfolios:
- **Producer API** (`POST /events`) publishes to Kafka topic `events`
- **Consumer Service** reads events in **batches**, persists to **MySQL**
- **Idempotency** via `UNIQUE(event_id)` (exactly-once effect in DB)
- **Retries (max 3 attempts)** + poison messages to **DLQ topic** `events.dlq`
- **Health endpoints** via Spring Boot Actuator
- **Docker Compose** local environment + Kafka UI
- **GitHub Actions CI**

---

## Tech Stack
Java 17, Spring Boot 3, Spring Kafka, MySQL 8, Docker Compose

---

## Architecture
1. Client calls `POST /events`
2. Producer publishes message to Kafka topic `events` (key = `eventId`)
3. Consumer reads `events` as **batch** → writes to MySQL
4. If processing fails:
   - retry the batch (up to 3 total attempts)
   - after retries exhausted → publish to `events.dlq`

---

## Kafka Topics
- `events`
- `events.dlq`

---

## Local Run (Mac)
### Start everything
```bash
docker compose up --build
