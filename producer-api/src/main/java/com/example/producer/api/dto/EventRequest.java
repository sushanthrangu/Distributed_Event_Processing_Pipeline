package com.example.producer.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record EventRequest(
    @NotBlank String eventId,
    @NotBlank String eventType,
    @NotNull Map<String, Object> payload
) {}
