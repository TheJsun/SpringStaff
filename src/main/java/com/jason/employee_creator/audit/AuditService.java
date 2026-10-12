package com.jason.employee_creator.audit;

import com.jason.employee_creator.audit.entities.AuditLog;
import com.jason.employee_creator.user.CurrentUser;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class AuditService {

  private final AuditLogRepository repo;
  private final ObjectMapper objectMapper;

  public AuditService(AuditLogRepository repo, ObjectMapper objectMapper) {
    this.repo = repo;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public void record(
    AuditAction action,
    Auditable entity,
    List<FieldChange> changes
  ) {
    CurrentUser actor = currentUser();
    AuditLog newAudit = new AuditLog(
      actor == null ? null : actor.getId(),
      actor == null ? "system" : actor.getUsername(),
      action,
      entity.getClass().getSimpleName(),
      entity.getId(),
      entity.auditLabel(),
      toJson(changes)
    );
    repo.save(newAudit);
  }

  private CurrentUser currentUser() {
    Authentication auth =
      SecurityContextHolder.getContext().getAuthentication();
    return auth != null && auth.getPrincipal() instanceof CurrentUser user
      ? user
      : null;
  }

  private String toJson(List<FieldChange> changes) {
    return objectMapper.writeValueAsString(changes);
  }
}
