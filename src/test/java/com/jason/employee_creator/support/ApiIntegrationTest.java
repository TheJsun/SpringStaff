package com.jason.employee_creator.support;

import static io.restassured.RestAssured.given;

import com.jason.employee_creator.department.DepartmentRepository;
import com.jason.employee_creator.department.entities.Department;
import com.jason.employee_creator.employee.EmployeeRepository;
import com.jason.employee_creator.employee.entities.ContractType;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.employee.entities.EmploymentType;
import com.jason.employee_creator.user.Role;
import com.jason.employee_creator.user.UserRepository;
import com.jason.employee_creator.user.entities.User;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.jdbc.Sql;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(
  scripts = "/sql/cleanup.sql",
  executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD
)
public abstract class ApiIntegrationTest {

  protected static final String ADMIN_EMAIL = "admin.test@example.com";
  protected static final String EMPLOYEE_EMAIL = "employee.test@example.com";
  protected static final String PASSWORD = "test-password";
  protected static final String SESSION_COOKIE = "JSESSIONID";

  @LocalServerPort
  protected int port;

  @Autowired
  protected UserRepository userRepository;

  @Autowired
  protected EmployeeRepository employeeRepository;

  @Autowired
  protected DepartmentRepository departmentRepository;

  @Autowired
  protected PasswordEncoder passwordEncoder;

  @BeforeEach
  public void configureRestAssuredPort() {
    RestAssured.port = this.port;
  }

  protected Department createDepartment(String name) {
    Department department = new Department();
    department.setName(name);
    return this.departmentRepository.saveAndFlush(department);
  }

  protected User createUser(String email, Role role, Employee employee) {
    return this.userRepository.saveAndFlush(
      new User(email, this.passwordEncoder.encode(PASSWORD), role, employee)
    );
  }

  protected String login(String email, String password) {
    return given()
      .contentType(ContentType.JSON)
      .body(Map.of("email", email, "password", password))
      .when()
      .post("/api/auth/login")
      .then()
      .statusCode(HttpStatus.OK.value())
      .extract()
      .cookie(SESSION_COOKIE);
  }

  protected String adminSession() {
    createUser(ADMIN_EMAIL, Role.ADMIN, null);
    return login(ADMIN_EMAIL, PASSWORD);
  }

  protected String employeeSession() {
    createUser(EMPLOYEE_EMAIL, Role.EMPLOYEE, null);
    return login(EMPLOYEE_EMAIL, PASSWORD);
  }

  protected Employee persistEmployee(String firstName, String email) {
    Employee employee = new Employee();
    employee.setFirstName(firstName);
    employee.setLastName("Tester");
    employee.setEmail(email);
    employee.setPhoneNumber("0412345678");
    employee.setAddress("1 Test Street, Melbourne VIC 3000");
    employee.setJobRole("Software Engineer");
    employee.setContractType(ContractType.PERMANENT);
    employee.setStartDate(LocalDate.of(2024, 1, 15));
    employee.setOnGoing(true);
    employee.setEmploymentType(EmploymentType.FULL_TIME);
    employee.setHoursPerWeek(38);
    return this.employeeRepository.saveAndFlush(employee);
  }
}
