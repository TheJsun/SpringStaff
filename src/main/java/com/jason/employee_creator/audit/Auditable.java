package com.jason.employee_creator.audit;

public interface Auditable {
  Long getId();
  String auditLabel();
}
