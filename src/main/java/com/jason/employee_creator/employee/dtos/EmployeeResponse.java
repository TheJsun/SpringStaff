package com.jason.employee_creator.employee.dtos;

import com.jason.employee_creator.department.dtos.DepartmentResponse;
import com.jason.employee_creator.employee.entities.ContractType;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.employee.entities.EmploymentType;
import java.time.LocalDate;
import java.util.List;

public record EmployeeResponse(
  Long id,
  String firstName,
  String lastName,
  String middleName,
  String email,
  String phoneNumber,
  String address,
  String jobRole,
  ContractType contractType,
  LocalDate startDate,
  LocalDate finishDate,
  Boolean onGoing,
  EmploymentType employmentType,
  Integer hoursPerWeek,
  DepartmentResponse department
) {
  public static EmployeeResponse of(Employee employee) {
    DepartmentResponse department =
      employee.getDepartment() != null
        ? DepartmentResponse.of(employee.getDepartment())
        : null;
    return new EmployeeResponse(
      employee.getId(),
      employee.getFirstName(),
      employee.getLastName(),
      employee.getMiddleName(),
      employee.getEmail(),
      employee.getPhoneNumber(),
      employee.getAddress(),
      employee.getJobRole(),
      employee.getContractType(),
      employee.getStartDate(),
      employee.getFinishDate(),
      employee.getOnGoing(),
      employee.getEmploymentType(),
      employee.getHoursPerWeek(),
      department
    );
  }

  public static List<EmployeeResponse> of(List<Employee> employees) {
    return employees.stream().map(EmployeeResponse::of).toList();
  }
}
