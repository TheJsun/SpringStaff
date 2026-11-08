package com.jason.employee_creator.document;

import com.jason.employee_creator.document.dtos.ConfirmUploadRequest;
import com.jason.employee_creator.document.dtos.DocumentResponse;
import com.jason.employee_creator.document.dtos.UploadUrlRequest;
import com.jason.employee_creator.document.dtos.UploadUrlResponse;
import com.jason.employee_creator.document.entities.Document;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees/{employeeId}/documents")
public class DocumentController {

  private final DocumentService documentService;

  public DocumentController(DocumentService documentService) {
    this.documentService = documentService;
  }

  @GetMapping()
  public ResponseEntity<List<DocumentResponse>> listDocuments(
    @PathVariable Long employeeId
  ) {
    List<DocumentSummary> documents = this.documentService.list(employeeId);
    return ResponseEntity.ok(DocumentResponse.of(documents));
  }

  @PostMapping("/upload-url")
  public UploadUrlResponse createUploadUrl(
    @PathVariable Long employeeId,
    @Valid @RequestBody UploadUrlRequest request
  ) {
    return documentService.createUploadUrl(employeeId, request);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public DocumentResponse confirmUpload(
    @PathVariable Long employeeId,
    @Valid @RequestBody ConfirmUploadRequest request
  ) {
    return DocumentResponse.of(
      documentService.confirmUpload(employeeId, request)
    );
  }

  @GetMapping("/{documentId}/content")
  public ResponseEntity<Void> downloadDocument(
    @PathVariable Long employeeId,
    @PathVariable Long documentId
  ) {
    String downloadUrl = this.documentService.getDownloadUrl(
      employeeId,
      documentId
    );

    return ResponseEntity.status(HttpStatus.FOUND)
      .location(URI.create(downloadUrl))
      .build();
  }

  @DeleteMapping("/{documentId}")
  public ResponseEntity<Void> deleteDocument(
    @PathVariable Long employeeId,
    @PathVariable Long documentId
  ) {
    this.documentService.delete(employeeId, documentId);
    return ResponseEntity.noContent().build();
  }
}
