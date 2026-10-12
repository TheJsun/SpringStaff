package com.jason.employee_creator.document;

import com.jason.employee_creator.document.entities.Document;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
  List<DocumentSummary> findByEmployeeIdOrderByUploadedAtAsc(Long employeeId);
}
