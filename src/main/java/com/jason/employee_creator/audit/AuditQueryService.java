package com.jason.employee_creator.audit;

import com.jason.employee_creator.audit.dtos.AuditActorResponse;
import com.jason.employee_creator.audit.dtos.AuditLogResponse;
import com.jason.employee_creator.audit.entities.AuditLog;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@Transactional
public class AuditQueryService {

  private final AuditLogRepository repo;
  private final ObjectMapper objectMapper;

  public AuditQueryService(AuditLogRepository repo, ObjectMapper objectMapper) {
    this.repo = repo;
    this.objectMapper = objectMapper;
  }

  @PreAuthorize("hasRole('ADMIN')")
  public Page<AuditLogResponse> search(
    String entityType,
    Long entityId,
    Long actorId,
    AuditAction action,
    Pageable pageable
  ) {
    Specification<AuditLog> spec = (root, query, cb) -> cb.conjunction();
    if (entityType != null) spec = spec.and((root, q, cb) ->
      cb.equal(root.get("entityType"), entityType)
    );
    if (entityId != null) spec = spec.and((root, q, cb) ->
      cb.equal(root.get("entityId"), entityId)
    );
    if (actorId != null) spec = spec.and((root, q, cb) ->
      cb.equal(root.get("actorId"), actorId)
    );
    if (action != null) spec = spec.and((root, q, cb) ->
      cb.equal(root.get("action"), action)
    );

    return repo.findAll(spec, pageable).map(this::toResponse);
  }

  @PreAuthorize("hasRole('ADMIN')")
  public List<AuditActorResponse> findDistinctActors() {
    return repo.findDistinctActors();
  }

  private AuditLogResponse toResponse(AuditLog log) {
    return new AuditLogResponse(
      log.getId(),
      log.getActorEmail(),
      log.getAction(),
      log.getEntityType(),
      log.getEntityId(),
      log.getEntityLabel(),
      parse(log.getDetails()),
      log.getCreatedAt()
    );
  }

  private JsonNode parse(String details) {
    return objectMapper.readTree(details);
  }
}
