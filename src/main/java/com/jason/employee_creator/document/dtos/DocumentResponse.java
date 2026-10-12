package com.jason.employee_creator.document.dtos;

import com.jason.employee_creator.document.DocumentSummary;
import com.jason.employee_creator.document.entities.Document;
import java.time.LocalDateTime;
import java.util.List;

public record DocumentResponse(
  Long id,
  String name,
  String fileName,
  String contentType,
  long sizeBytes,
  LocalDateTime uploadedAt,
  Long uploadedByUserId,
  String uploadedByName
) {
  public static DocumentResponse of(Document document) {
    return new DocumentResponse(
      document.getId(),
      document.getName(),
      document.getFileName(),
      document.getContentType(),
      document.getSizeBytes(),
      document.getUploadedAt(),
      document.getUploadedByUserId(),
      document.getUploadedByName()
    );
  }

  public static DocumentResponse of(DocumentSummary summary) {
    return new DocumentResponse(
      summary.getId(),
      summary.getName(),
      summary.getFileName(),
      summary.getContentType(),
      summary.getSizeBytes(),
      summary.getUploadedAt(),
      summary.getUploadedByUserId(),
      summary.getUploadedByName()
    );
  }

  public static List<DocumentResponse> of(List<DocumentSummary> summaries) {
    return summaries.stream().map(DocumentResponse::of).toList();
  }
}
