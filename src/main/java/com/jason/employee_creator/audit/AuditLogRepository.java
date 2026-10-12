package com.jason.employee_creator.audit;

import com.jason.employee_creator.audit.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditLogRepository
  extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {}
