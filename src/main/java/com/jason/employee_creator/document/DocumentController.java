package com.jason.employee_creator.document;

import com.jason.employee_creator.document.dtos.DocumentResponse;
import com.jason.employee_creator.document.entities.Document;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<DocumentResponse> uploadDocument(
    @PathVariable Long employeeId,
    @RequestPart("file") MultipartFile file,
    @RequestParam("name") String name
  ) {
    Document created = this.documentService.upload(employeeId, file, name);
    return new ResponseEntity<>(
      DocumentResponse.of(created),
      HttpStatus.CREATED
    );
  }

  @GetMapping("/{documentId}/content")
  public ResponseEntity<byte[]> downloadDocument(
    @PathVariable Long employeeId,
    @PathVariable Long documentId
  ) {
    Document document =
      this.documentService.getForDownload(employeeId, documentId);

    ContentDisposition disposition = ContentDisposition
      .inline()
      .filename(document.getFileName())
      .build();

    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
      .contentType(MediaType.parseMediaType(document.getContentType()))
      .body(document.getData());
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
