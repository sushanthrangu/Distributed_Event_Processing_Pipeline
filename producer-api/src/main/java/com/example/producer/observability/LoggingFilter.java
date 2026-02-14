package com.example.producer.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
  private static final String TRACE_ID = "trace_id";

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {

    long start = System.currentTimeMillis();

    String traceId = request.getHeader("X-Trace-Id");
    if (traceId == null || traceId.isBlank()) {
      traceId = UUID.randomUUID().toString();
    }

    MDC.put(TRACE_ID, traceId);
    response.setHeader("X-Trace-Id", traceId);

    try {
      log.info("request_start method={} uri={}", request.getMethod(), request.getRequestURI());

      filterChain.doFilter(request, response);

      long duration = System.currentTimeMillis() - start;
      log.info("request_complete status={} duration_ms={}", response.getStatus(), duration);

    } finally {
      MDC.clear();
    }
  }
}
