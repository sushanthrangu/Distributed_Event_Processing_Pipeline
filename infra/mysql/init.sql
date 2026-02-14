-- ============================================
-- Event Processing System - Database Schema
-- ============================================
-- This script runs automatically when MySQL container starts
-- Creates tables for event storage and dead letter queue

-- Ensure proper character set for JSON and international characters
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Use the events database
USE events_db;

-- ============================================
-- MAIN EVENTS TABLE
-- ============================================
-- Stores all events with status tracking and idempotency support

CREATE TABLE IF NOT EXISTS events (
    -- Primary key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Event identification (UNIQUE for idempotency)
    event_id VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique identifier for idempotency',
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL COMMENT 'Type of event (e.g., user.created, order.placed)',
    
    -- Event data (stored as JSON)
    payload JSON NOT NULL COMMENT 'Event payload in JSON format',
    
    -- Processing status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' 
        COMMENT 'Current status: PENDING, PROCESSING, COMPLETED, FAILED, DLQ',
    
    -- Retry tracking
    retry_count INT NOT NULL DEFAULT 0 
        COMMENT 'Number of retry attempts',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
        COMMENT 'When event was received',
    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
        COMMENT 'Last update time',
    
    processed_at TIMESTAMP NULL 
        COMMENT 'When event was successfully processed',
    
    -- Error tracking
    error_message TEXT NULL 
        COMMENT 'Error message if processing failed',
    
    -- Indexes for query performance
    INDEX idx_event_id (event_id),
    INDEX idx_event_type (event_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_processed_at (processed_at),
    INDEX idx_status_created (status, created_at)
    
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Main events table with idempotency support';

-- ============================================
-- DEAD LETTER QUEUE TABLE
-- ============================================
-- Stores events that failed after max retry attempts

CREATE TABLE IF NOT EXISTS dead_letter_queue (
    -- Primary key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Event identification
    event_id VARCHAR(255) NOT NULL 
        COMMENT 'Original event ID',
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL 
        COMMENT 'Type of event that failed',
    
    -- Event data
    payload JSON NOT NULL 
        COMMENT 'Original event payload',
    
    -- Failure tracking
    retry_count INT NOT NULL 
        COMMENT 'Number of retry attempts before DLQ',
    
    error_message TEXT NOT NULL 
        COMMENT 'Final error message',
    
    original_topic VARCHAR(255) NOT NULL 
        COMMENT 'Original Kafka topic',
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
        COMMENT 'When event was moved to DLQ',
    
    -- Indexes
    INDEX idx_event_id (event_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_original_topic (original_topic)
    
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Dead letter queue for failed events';

-- ============================================
-- PROCESSING METRICS TABLE (Optional)
-- ============================================
-- Tracks daily processing statistics

CREATE TABLE IF NOT EXISTS processing_metrics (
    -- Primary key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Date dimension
    metric_date DATE NOT NULL 
        COMMENT 'Date of metrics',
    
    -- Counters
    total_events INT NOT NULL DEFAULT 0 
        COMMENT 'Total events received',
    
    successful_events INT NOT NULL DEFAULT 0 
        COMMENT 'Successfully processed events',
    
    failed_events INT NOT NULL DEFAULT 0 
        COMMENT 'Failed events (after retries)',
    
    dlq_events INT NOT NULL DEFAULT 0 
        COMMENT 'Events sent to DLQ',
    
    -- Performance metrics
    avg_processing_time_ms DOUBLE NOT NULL DEFAULT 0 
        COMMENT 'Average processing time in milliseconds',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint on date
    UNIQUE KEY uk_metric_date (metric_date),
    INDEX idx_metric_date (metric_date)
    
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Daily processing metrics';

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to insert sample events for testing

/*
INSERT INTO events (event_id, event_type, payload, status) VALUES
('test-001', 'user.created', '{"user_id": "U001", "email": "test@example.com", "name": "Test User"}', 'COMPLETED'),
('test-002', 'order.placed', '{"order_id": "ORD001", "amount": 99.99, "items": 3}', 'COMPLETED'),
('test-003', 'payment.processed', '{"payment_id": "PAY001", "amount": 99.99, "status": "success"}', 'COMPLETED');
*/

-- ============================================
-- VIEWS (Optional - for monitoring)
-- ============================================

-- View for event processing summary
CREATE OR REPLACE VIEW v_event_summary AS
SELECT 
    event_type,
    status,
    COUNT(*) as count,
    AVG(retry_count) as avg_retries,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM events
GROUP BY event_type, status;

-- View for recent failed events
CREATE OR REPLACE VIEW v_recent_failures AS
SELECT 
    event_id,
    event_type,
    status,
    retry_count,
    error_message,
    created_at,
    updated_at
FROM events
WHERE status IN ('FAILED', 'DLQ')
ORDER BY updated_at DESC
LIMIT 100;

-- View for processing performance
CREATE OR REPLACE VIEW v_processing_performance AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_events,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
    SUM(CASE WHEN status = 'DLQ' THEN 1 ELSE 0 END) as dlq,
    AVG(TIMESTAMPDIFF(SECOND, created_at, processed_at)) as avg_processing_seconds
FROM events
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- STORED PROCEDURES (Optional - for cleanup)
-- ============================================

-- Procedure to archive old completed events
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS archive_old_events(IN days_old INT)
BEGIN
    DECLARE rows_archived INT DEFAULT 0;
    
    -- Archive events older than specified days with COMPLETED status
    DELETE FROM events 
    WHERE status = 'COMPLETED' 
    AND created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);
    
    SET rows_archived = ROW_COUNT();
    
    SELECT CONCAT('Archived ', rows_archived, ' old events') as result;
END$$

DELIMITER ;

-- ============================================
-- GRANTS AND PERMISSIONS
-- ============================================

-- Grant all privileges to eventuser
GRANT ALL PRIVILEGES ON events_db.* TO 'eventuser'@'%';
FLUSH PRIVILEGES;

-- ============================================
-- INITIALIZATION COMPLETE
-- ============================================

SELECT 'Database schema initialized successfully!' as Status;

-- Show table structure
SHOW TABLES;

-- Show indexes on events table
SHOW INDEX FROM events;