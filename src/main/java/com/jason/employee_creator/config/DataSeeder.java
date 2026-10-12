package com.jason.employee_creator.config;

import com.jason.employee_creator.department.DepartmentRepository;
import com.jason.employee_creator.department.entities.Department;
import com.jason.employee_creator.employee.EmployeeRepository;
import com.jason.employee_creator.employee.entities.ContractType;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.employee.entities.EmploymentType;
import com.jason.employee_creator.user.Role;
import com.jason.employee_creator.user.UserRepository;
import com.jason.employee_creator.user.entities.User;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
// Demo-only data with known passwords - must never run outside dev.
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

  private final EmployeeRepository employeeRepository;
  private final UserRepository userRepository;
  private final DepartmentRepository departmentRepository;
  private final PasswordEncoder passwordEncoder;

  public DataSeeder(
    EmployeeRepository employeeRepository,
    UserRepository userRepository,
    DepartmentRepository departmentRepository,
    PasswordEncoder passwordEncoder
  ) {
    this.employeeRepository = employeeRepository;
    this.userRepository = userRepository;
    this.departmentRepository = departmentRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (userRepository.count() > 0) {
      return;
    }
    Department exampleDepartment = new Department("Example Department");
    departmentRepository.save(exampleDepartment);

    create(
      "admin@demo.com",
      "admin123",
      Role.ADMIN,
      new Employee(
        "Ada",
        "Jones",
        "Smith",
        "admin@demo.com",
        "0412345678",
        "demo address",
        "Manager",
        ContractType.PERMANENT,
        LocalDate.of(2026, 3, 10),
        null,
        true,
        EmploymentType.FULL_TIME,
        132,
        exampleDepartment
      )
    );
    create(
      "bob@demo.com",
      "password123",
      Role.EMPLOYEE,
      new Employee(
        "Bob",
        "Fox",
        "Smith",
        "bob@demo.com",
        "0413345678",
        "demo address",
        "Tester",
        ContractType.PERMANENT,
        LocalDate.of(2026, 3, 10),
        null,
        true,
        EmploymentType.FULL_TIME,
        122,
        exampleDepartment
      )
    );
    create(
      "alice@demo.com",
      "password123",
      Role.EMPLOYEE,
      new Employee(
        "Alice",
        "Smith",
        null,
        "alice@demo.com",
        "0412342678",
        "demo address",
        "Software Engineer",
        ContractType.CONTRACT,
        LocalDate.of(2026, 3, 10),
        LocalDate.now(),
        false,
        EmploymentType.FULL_TIME,
        12,
        exampleDepartment
      )
    );
  }

  private void create(
    String email,
    String rawPassword,
    Role role,
    Employee employee
  ) {
    Employee saved = employeeRepository.save(employee);
    userRepository.save(
      new User(email, passwordEncoder.encode(rawPassword), role, saved)
    );
  }
}
