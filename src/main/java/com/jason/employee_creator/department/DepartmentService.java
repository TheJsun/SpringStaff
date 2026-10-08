package com.jason.employee_creator.department;

import com.jason.employee_creator.common.exceptions.DepartmentInUseException;
import com.jason.employee_creator.common.exceptions.DuplicateFieldException;
import com.jason.employee_creator.common.exceptions.NotFoundException;
import com.jason.employee_creator.department.dtos.CreateDepartmentRequest;
import com.jason.employee_creator.department.dtos.UpdateDepartmentRequest;
import com.jason.employee_creator.department.entities.Department;
import com.jason.employee_creator.employee.EmployeeRepository;
import com.jason.employee_creator.employee.entities.Employee;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DepartmentService {

  private final DepartmentRepository departmentRepository;
  private final EmployeeRepository employeeRepository;
  private final ModelMapper mapper;

  public DepartmentService(
    DepartmentRepository departmentRepository,
    EmployeeRepository employeeRepository,
    ModelMapper mapper
  ) {
    this.departmentRepository = departmentRepository;
    this.employeeRepository = employeeRepository;
    this.mapper = mapper;
  }

  public List<Department> findAll() {
    return this.departmentRepository.findAll();
  }

  public Department findById(Long id) {
    return this.departmentRepository
      .findById(id)
      .orElseThrow(() ->
        new NotFoundException("Could not find Department with id = " + id)
      );
  }

  @PreAuthorize("hasRole('ADMIN')")
  public Department create(CreateDepartmentRequest data) {
    log.info("Attempting to create department with name={}", data.getName());

    if (this.departmentRepository.existsByName(data.getName())) {
      log.warn("Create department failed - duplicate name={}", data.getName());
      throw new DuplicateFieldException("name", data.getName());
    }

    Department createdDepartment = this.mapper.map(data, Department.class);
    createdDepartment.setLead(resolveLead(data.getLeadId()));
    this.departmentRepository.saveAndFlush(createdDepartment);
    log.info(
      "Created department id={} name={}",
      createdDepartment.getId(),
      createdDepartment.getName()
    );
    return createdDepartment;
  }

  @PreAuthorize("hasRole('ADMIN')")
  public void deleteById(Long id) {
    log.info("Attempting to delete department id={}", id);
    Department target = this.findById(id);
    if (employeeRepository.existsByDepartmentId(id)) {
      throw new DepartmentInUseException(id);
    }

    this.departmentRepository.delete(target);
    log.info("Deleted department id={}", id);
  }

  @PreAuthorize("hasRole('ADMIN')")
  public Department update(Long id, UpdateDepartmentRequest data) {
    Department existing = this.findById(id);

    this.mapper.map(data, existing);
    existing.setLead(resolveLead(data.getLeadId()));
    this.departmentRepository.saveAndFlush(existing);

    return existing;
  }

  private Employee resolveLead(Long leadId) {
    if (leadId == null) {
      return null;
    }
    return this.employeeRepository
      .findById(leadId)
      .orElseThrow(() ->
        new NotFoundException("Could not find Employee with id = " + leadId)
      );
  }
}
