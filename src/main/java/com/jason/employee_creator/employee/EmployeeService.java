package com.jason.employee_creator.employee;

import com.jason.employee_creator.common.exceptions.DuplicateFieldException;
import com.jason.employee_creator.common.exceptions.NotFoundException;
import com.jason.employee_creator.common.exceptions.UnprocessableContentException;
import com.jason.employee_creator.department.DepartmentRepository;
import com.jason.employee_creator.department.entities.Department;
import com.jason.employee_creator.employee.dtos.CreateEmployeeRequest;
import com.jason.employee_creator.employee.dtos.CreateEmployeeResult;
import com.jason.employee_creator.employee.dtos.UpdateEmployeeRequest;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.user.CurrentUser;
import com.jason.employee_creator.user.Emails;
import com.jason.employee_creator.user.Role;
import com.jason.employee_creator.user.User;
import com.jason.employee_creator.user.UserRepository;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class EmployeeService {

  private final EmployeeRepository repo;
  private final ModelMapper mapper;
  private final DepartmentRepository departmentRepository;
  private final UserRepository userRepository;
  private static final SecureRandom RANDOM = new SecureRandom();
  private final PasswordEncoder passwordEncoder;

  public EmployeeService(
    EmployeeRepository repo,
    ModelMapper mapper,
    DepartmentRepository departmentRepository,
    UserRepository userRepository,
    PasswordEncoder passwordEncoder
  ) {
    this.repo = repo;
    this.mapper = mapper;
    this.departmentRepository = departmentRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public List<Employee> findAll() {
    return this.repo.findAll();
  }

  public Employee findById(Long id) {
    return this.repo
      .findById(id)
      .orElseThrow(() ->
        new NotFoundException("Could not find Employee with id = " + id)
      );
  }

  private Department resolveDepartment(Long id) {
    Department departmentResult = this.departmentRepository
      .findById(id)
      .orElseThrow(() ->
        new UnprocessableContentException(
          "No department exists with id = " + id
        )
      );
    return departmentResult;
  }

  @PreAuthorize("hasRole('ADMIN')")
  @Transactional
  public CreateEmployeeResult create(CreateEmployeeRequest data) {
    log.info("Attempting to create employee with email={}", data.getEmail());

    if (this.repo.existsByEmail(data.getEmail())) {
      log.warn("Create employee failed - duplicate email={}", data.getEmail());

      throw new DuplicateFieldException("email", data.getEmail());
    }

    String loginEmail = Emails.normalise(data.getEmail());
    if (this.userRepository.existsByEmail(loginEmail)) {
      log.warn("Create employee failed - duplicate login email={}", loginEmail);

      throw new DuplicateFieldException("email", data.getEmail());
    }

    Employee createdEmployee = this.mapper.map(data, Employee.class);
    Department foundDepartment = resolveDepartment(data.getDepartmentId());
    createdEmployee.setDepartment(foundDepartment);
    this.repo.saveAndFlush(createdEmployee);
    log.info(
      "Created employee id={} email={}",
      createdEmployee.getId(),
      createdEmployee.getEmail()
    );

    String temporaryPassword = generateTemporaryPassword();
    User createdUser = new User(
      loginEmail,
      passwordEncoder.encode(temporaryPassword),
      Role.EMPLOYEE,
      createdEmployee
    );

    userRepository.saveAndFlush(createdUser);
    log.info(
      "Created login account id={} email={} for employee id={}",
      createdUser.getId(),
      createdUser.getEmail(),
      createdEmployee.getId()
    );

    return new CreateEmployeeResult(createdEmployee, temporaryPassword);
  }

  @PreAuthorize("hasRole('ADMIN')")
  @Transactional
  public void deleteById(Long id) {
    log.info("Attempting to delete employee id={}", id);

    Employee target = this.findById(id);
    Authentication authentication =
      SecurityContextHolder.getContext().getAuthentication();
    if (
      authentication != null &&
      authentication.getPrincipal() instanceof CurrentUser currentUser &&
      id.equals(currentUser.getEmployeeId())
    ) {
      throw new UnprocessableContentException(
        "You cannot delete your own employee record"
      );
    }

    Optional<User> linkedUser = this.userRepository.findByEmployeeId(id);
    if (linkedUser.isPresent()) {
      User user = linkedUser.get();

      this.userRepository.delete(user);
      log.info(
        "Deleted login account id={} for employee id={}",
        user.getId(),
        id
      );
    }

    this.repo.delete(target);
    log.info("Deleted employee id={}", id);
  }

  @PreAuthorize("hasRole('ADMIN')")
  public Employee update(Long id, UpdateEmployeeRequest data) {
    Employee existing = findById(id);
    if (
      data.getEmail() != null && repo.existsByEmailAndIdNot(data.getEmail(), id)
    ) {
      throw new DuplicateFieldException("email", data.getEmail());
    }
    mapper.map(data, existing);
    if (data.getDepartmentId() != null) {
      Department foundDepartment = resolveDepartment(data.getDepartmentId());
      existing.setDepartment(foundDepartment);
    }
    log.info("Updated employee with id={} with new data", existing.getId());
    return repo.saveAndFlush(existing);
  }

  private String generateTemporaryPassword() {
    byte[] bytes = new byte[12];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}
