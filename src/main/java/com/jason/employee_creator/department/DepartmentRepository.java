package com.jason.employee_creator.department;

import com.jason.employee_creator.department.entities.Department;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
  boolean existsByName(String name);
  Optional<Department> findByName(String name);

  List<Department> findByLeadId(Long leadId);
}
