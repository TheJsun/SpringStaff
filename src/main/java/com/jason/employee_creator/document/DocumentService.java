package com.jason.employee_creator.document;

import com.jason.employee_creator.audit.AuditService;
import com.jason.employee_creator.audit.NotAudited;
import com.jason.employee_creator.common.exceptions.NotFoundException;
import com.jason.employee_creator.common.exceptions.UnprocessableContentException;
import com.jason.employee_creator.document.dtos.ConfirmUploadRequest;
import com.jason.employee_creator.document.dtos.UploadUrlRequest;
import com.jason.employee_creator.document.dtos.UploadUrlResponse;
import com.jason.employee_creator.document.entities.Document;
import com.jason.employee_creator.employee.EmployeeRepository;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.user.CurrentUser;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

@Service
@Slf4j
public class DocumentService {

  private final AuditService auditService;

  private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024;

  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );

  private final DocumentRepository documentRepository;
  private final EmployeeRepository employeeRepository;
  private final S3StorageService storageService;

  public DocumentService(
    DocumentRepository documentRepository,
    EmployeeRepository employeeRepository,
    AuditService auditService,
    S3StorageService storageService
  ) {
    this.documentRepository = documentRepository;
    this.employeeRepository = employeeRepository;
    this.auditService = auditService;
    this.storageService = storageService;
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public List<DocumentSummary> list(Long employeeId) {
    requireEmployee(employeeId);
    return this.documentRepository.findByEmployeeIdOrderByUploadedAtAsc(
      employeeId
    );
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public UploadUrlResponse createUploadUrl(
    Long employeeId,
    UploadUrlRequest req
  ) {
    if (req.sizeBytes() > MAX_FILE_SIZE_BYTES) {
      requireEmployee(employeeId);
      throw new UnprocessableContentException(
        "File exceeds the maximum size of 10 MB"
      );
    }
    if (
      req.contentType() == null ||
      !ALLOWED_CONTENT_TYPES.contains(req.contentType())
    ) {
      throw new UnprocessableContentException(
        "Unsupported file type. Allowed types are PDF, JPG, PNG and DOCX"
      );
    }

    String key = "employees/" + employeeId + "/" + UUID.randomUUID();
    String url = storageService.presignUpload(
      key,
      req.contentType(),
      req.sizeBytes()
    );
    return new UploadUrlResponse(key, url);
  }

  @Transactional
  public Document confirmUpload(Long employeeId, ConfirmUploadRequest req) {
    Employee employee = requireEmployee(employeeId);

    if (!req.s3Key().startsWith("employees/" + employeeId + "/")) {
      throw new UnprocessableContentException("Invalid document key");
    }
    HeadObjectResponse head = storageService
      .head(req.s3Key())
      .orElseThrow(() ->
        new UnprocessableContentException("The file was not uploaded")
      );

    if (
      head.contentLength() > MAX_FILE_SIZE_BYTES ||
      !ALLOWED_CONTENT_TYPES.contains(head.contentType())
    ) {
      storageService.delete(req.s3Key());
      throw new UnprocessableContentException(
        "File is too large or not a supported type"
      );
    }

    Document createdDocument = new Document();
    createdDocument.setName(req.name());
    createdDocument.setFileName(req.fileName());
    createdDocument.setContentType(head.contentType());
    createdDocument.setSizeBytes(head.contentLength());
    createdDocument.setEmployee(employee);
    createdDocument.setUploadedByName(employee.getFirstName());
    createdDocument.setUploadedByUserId(employeeId);
    createdDocument.setUploadedAt(LocalDateTime.now());
    createdDocument.setS3Key(req.s3Key());

    this.documentRepository.saveAndFlush(createdDocument);
    this.auditService.recordCreated(createdDocument);

    return createdDocument;
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public String getDownloadUrl(Long employeeId, Long documentId) {
    Document document = findOwnedDocument(employeeId, documentId);
    return this.storageService.presignDownload(
      document.getS3Key(),
      document.getFileName(),
      document.getContentType()
    );
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public void delete(Long employeeId, Long documentId) {
    Document document = findOwnedDocument(employeeId, documentId);
    auditService.recordDeleted(document);
    this.documentRepository.delete(document);
    storageService.delete(document.getS3Key());
    log.info(
      "Deleted document id={} for employee id={}",
      documentId,
      employeeId
    );
  }

  private Document findOwnedDocument(Long employeeId, Long documentId) {
    Document document = this.documentRepository
      .findById(documentId)
      .orElseThrow(() ->
        new NotFoundException("Could not find Document with id = " + documentId)
      );
    if (!document.getEmployee().getId().equals(employeeId)) {
      throw new NotFoundException(
        "Could not find Document with id = " + documentId
      );
    }
    return document;
  }

  private Employee requireEmployee(Long employeeId) {
    return this.employeeRepository
      .findById(employeeId)
      .orElseThrow(() ->
        new NotFoundException("Could not find Employee with id = " + employeeId)
      );
  }
}
