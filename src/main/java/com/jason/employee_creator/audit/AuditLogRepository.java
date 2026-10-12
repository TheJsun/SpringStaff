package com.jason.employee_creator.audit;

import com.jason.employee_creator.audit.dtos.AuditActorResponse;
import com.jason.employee_creator.audit.entities.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface AuditLogRepository
  extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
  // Distinct actors for the frontend audit filter. Rows with a null actorId
  // (the "system" actor) are excluded because they can't be filtered by
  // actorId server-side.
  @Query(
    "select distinct new com.jason.employee_creator.audit.dtos.AuditActorResponse(a.actorId, a.actorEmail) " +
    "from AuditLog a where a.actorId is not null order by a.actorEmail"
  )
  List<AuditActorResponse> findDistinctActors();
}
