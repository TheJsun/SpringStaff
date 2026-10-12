package com.jason.employee_creator.audit.entities;

import com.jason.employee_creator.audit.AuditAction;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(
  name = "audit_log",
  indexes = {
    @Index(columnList = "entityType, entityId"),
    @Index(columnList = "createdAt"),
  }
)
public class AuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Long actorId;
  private String actorEmail;

  @Enumerated(EnumType.STRING)
  private AuditAction action;

  private String entityType;
  private Long entityId;
  private String entityLabel;

  @Lob
  private String details;

  private Instant createdAt = Instant.now();

  protected AuditLog() {}

  public AuditLog(
    Long actorId,
    String actorEmail,
    AuditAction action,
    String entityType,
    Long entityId,
    String entityLabel,
    String details
  ) {
    this.actorId = actorId;
    this.actorEmail = actorEmail;
    this.action = action;
    this.entityType = entityType;
    this.entityId = entityId;
    this.entityLabel = entityLabel;
    this.details = details;
  }

  public Long getId() {
    return id;
  }

  public Long getActorId() {
    return actorId;
  }

  public String getActorEmail() {
    return actorEmail;
  }

  public AuditAction getAction() {
    return action;
  }

  public String getEntityType() {
    return entityType;
  }

  public Long getEntityId() {
    return entityId;
  }

  public String getEntityLabel() {
    return entityLabel;
  }

  public String getDetails() {
    return details;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
