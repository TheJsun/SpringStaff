package com.jason.employee_creator.document;

import com.jason.employee_creator.audit.AuditService;
import com.jason.employee_creator.common.exceptions.NotFoundException;
import com.jason.employee_creator.common.exceptions.UnprocessableContentException;
import com.jason.employee_creator.document.entities.Document;
import com.jason.employee_creator.employee.EmployeeRepository;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.user.CurrentUser;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

  public DocumentService(
    DocumentRepository documentRepository,
    EmployeeRepository employeeRepository,
    AuditService auditService
  ) {
    this.documentRepository = documentRepository;
    this.employeeRepository = employeeRepository;
    this.auditService = auditService;
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public List<DocumentSummary> list(Long employeeId) {
    requireEmployee(employeeId);
    return this.documentRepository.findByEmployeeIdOrderByUploadedAtAsc(
      employeeId
    );
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public Document upload(Long employeeId, MultipartFile file, String name) {
    if (file == null || file.isEmpty()) {
      throw new UnprocessableContentException("A file is required");
    }
    if (file.getSize() > MAX_FILE_SIZE_BYTES) {
      throw new UnprocessableContentException(
        "File exceeds the maximum size of 10 MB"
      );
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new UnprocessableContentException(
        "Unsupported file type. Allowed types are PDF, JPG, PNG and DOCX"
      );
    }
    if (name == null || name.isBlank()) {
      throw new UnprocessableContentException("A document name is required");
    }

    Employee owner = requireEmployee(employeeId);
    CurrentUser uploader = currentUser();

    Document document = new Document();
    document.setName(name.trim());
    document.setFileName(file.getOriginalFilename());
    document.setContentType(contentType);
    document.setSizeBytes(file.getSize());
    document.setData(readBytes(file));
    document.setEmployee(owner);
    document.setUploadedByUserId(uploader.getId());
    document.setUploadedByName(resolveUploaderName(uploader));
    document.setUploadedAt(LocalDateTime.now());

    this.documentRepository.saveAndFlush(document);
    auditService.recordCreated(document);
    log.info(
      "Uploaded document id={} for employee id={} by user id={}",
      document.getId(),
      employeeId,
      uploader.getId()
    );
    return document;
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public Document getForDownload(Long employeeId, Long documentId) {
    return findOwnedDocument(employeeId, documentId);
  }

  @PreAuthorize("hasRole('ADMIN') or #employeeId == principal.employeeId")
  public void delete(Long employeeId, Long documentId) {
    Document document = findOwnedDocument(employeeId, documentId);
    auditService.recordDeleted(document);
    this.documentRepository.delete(document);
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

  private byte[] readBytes(MultipartFile file) {
    try {
      return file.getBytes();
    } catch (IOException ex) {
      log.warn("Failed to read uploaded file bytes: {}", ex.getMessage());
      throw new UnprocessableContentException(
        "Could not read the uploaded file"
      );
    }
  }

  private String resolveUploaderName(CurrentUser uploader) {
    if (uploader.getEmployeeId() != null) {
      return this.employeeRepository
        .findById(uploader.getEmployeeId())
        .map(employee ->
          (employee.getFirstName() + " " + employee.getLastName()).trim()
        )
        .orElse(uploader.getUsername());
    }
    return uploader.getUsername();
  }

  private CurrentUser currentUser() {
    Authentication authentication =
      SecurityContextHolder.getContext().getAuthentication();
    if (
      authentication != null &&
      authentication.getPrincipal() instanceof CurrentUser currentUser
    ) {
      return currentUser;
    }
    throw new UnprocessableContentException("No authenticated user");
  }
}
