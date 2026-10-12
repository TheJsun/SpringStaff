package com.jason.employee_creator.department.dtos;

import com.jason.employee_creator.department.entities.Department;
import java.util.List;

public record DepartmentResponse(
  Long id,
  String name,
  String description,
  DepartmentLead lead
) {
  public static DepartmentResponse of(Department department) {
    return new DepartmentResponse(
      department.getId(),
      department.getName(),
      department.getDescription(),
      DepartmentLead.of(department.getLead())
    );
  }

  public static List<DepartmentResponse> of(List<Department> departments) {
    return departments.stream().map(DepartmentResponse::of).toList();
  }
}
