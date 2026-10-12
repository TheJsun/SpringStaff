package com.jason.employee_creator.document;

import java.time.LocalDateTime;

/**
 * Closed projection for listing documents without loading the file bytes
 * (the {@code data} BLOB is intentionally omitted).
 */
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
