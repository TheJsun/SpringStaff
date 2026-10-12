package com.jason.employee_creator.department.dtos;

import com.jason.employee_creator.employee.entities.Employee;

public record DepartmentLead(
  Long id,
  String firstName,
  String lastName,
  String email,
  String jobRole
) {
  public static DepartmentLead of(Employee employee) {
    if (employee == null) {
      return null;
    }
    return new DepartmentLead(
      employee.getId(),
      employee.getFirstName(),
      employee.getLastName(),
      employee.getEmail(),
      employee.getJobRole()
    );
  }
}
