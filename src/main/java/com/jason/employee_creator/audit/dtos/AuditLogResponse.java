package com.jason.employee_creator.audit.dtos;

import com.jason.employee_creator.audit.AuditAction;
import java.time.Instant;
import tools.jackson.databind.JsonNode;

public record AuditLogResponse(
  Long id,
  String actorEmail,
  AuditAction action,
  String entityType,
  Long entityId,
  String entityLabel,
  JsonNode details,
  Instant createdAt
) {}
