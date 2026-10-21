package com.jason.employee_creator.document;

import java.time.LocalDateTime;

public interface DocumentSummary {
  Long getId();
  String getName();
  String getFileName();
  String getContentType();
  long getSizeBytes();
  LocalDateTime getUploadedAt();
  Long getUploadedByUserId();
  String getUploadedByName();
}
