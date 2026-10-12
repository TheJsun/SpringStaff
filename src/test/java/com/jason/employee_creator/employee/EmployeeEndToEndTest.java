package com.jason.employee_creator.employee;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.jason.employee_creator.department.entities.Department;
import com.jason.employee_creator.employee.dtos.CreateEmployeeRequest;
import com.jason.employee_creator.employee.entities.ContractType;
import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.employee.entities.EmploymentType;
import com.jason.employee_creator.support.ApiIntegrationTest;
import com.jason.employee_creator.user.Role;
import com.jason.employee_creator.user.entities.User;
import io.restassured.http.ContentType;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

public class EmployeeEndToEndTest extends ApiIntegrationTest {

  private CreateEmployeeRequest validRequest(Long departmentId) {
    CreateEmployeeRequest dto = new CreateEmployeeRequest();
    dto.setFirstName("validFirstName");
    dto.setLastName("validLastName");
    dto.setMiddleName("validMiddleName");
    dto.setEmail("validEmail@gmail.com");
    dto.setPhoneNumber("0412345678");
    dto.setAddress("123 Example Street, Melbourne VIC 3000");
    dto.setJobRole("Software Engineer");
    dto.setDepartmentId(departmentId);
    dto.setContractType(ContractType.CONTRACT);
    dto.setStartDate(LocalDate.of(2023, 6, 1));
    dto.setFinishDate(LocalDate.of(2024, 6, 1));
    dto.setOnGoing(false);
    dto.setEmploymentType(EmploymentType.PART_TIME);
    dto.setHoursPerWeek(30);
    return dto;
  }

  //Tests for Getting Employees

  @Test
  public void getAllEmployees_noEmployeesInDB_returnOkAndEmptyArray() {
    String session = employeeSession();

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .get("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.OK.value())
      .body("$", hasSize(0));
  }

  @Test
  public void getAllEmployee_employeesInDB_returnsOkAndArrayOfEmployees() {
    String session = employeeSession();

    Employee employee1 = new Employee();
    employee1.setFirstName("Jane");
    employee1.setLastName("Doe");
    employee1.setMiddleName("Marie");
    employee1.setEmail("jane.doe@example.com");
    employee1.setPhoneNumber("0412345678");
    employee1.setAddress("123 Example Street, Melbourne VIC 3000");
    employee1.setJobRole("Software Engineer");
    employee1.setContractType(ContractType.PERMANENT);
    employee1.setStartDate(LocalDate.of(2024, 1, 15));
    employee1.setFinishDate(null);
    employee1.setOnGoing(true);
    employee1.setEmploymentType(EmploymentType.FULL_TIME);
    employee1.setHoursPerWeek(38);
    employeeRepository.saveAndFlush(employee1);

    Employee employee2 = new Employee();
    employee2.setFirstName("John");
    employee2.setLastName("Smith");
    employee2.setMiddleName(null);
    employee2.setEmail("john.smith@example.com");
    employee2.setPhoneNumber("0498765432");
    employee2.setAddress("456 Sample Ave, Sydney NSW 2000");
    employee2.setJobRole("Sales Manager");
    employee2.setContractType(ContractType.CONTRACT);
    employee2.setStartDate(LocalDate.of(2023, 6, 1));
    employee2.setFinishDate(LocalDate.of(2024, 6, 1));
    employee2.setOnGoing(false);
    employee2.setEmploymentType(EmploymentType.PART_TIME);
    employee2.setHoursPerWeek(20);
    employeeRepository.saveAndFlush(employee2);

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .get("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.OK.value())
      .body("$", hasSize(2))
      .body("firstName", hasItems("Jane", "John"))
      .body("lastName", hasItems("Doe", "Smith"))
      .body("middleName", hasItem("Marie"))
      .body("email", hasItems("jane.doe@example.com", "john.smith@example.com"))
      .body("phoneNumber", hasItems("0412345678", "0498765432"))
      .body(
        "address",
        hasItems(
          "123 Example Street, Melbourne VIC 3000",
          "456 Sample Ave, Sydney NSW 2000"
        )
      )
      .body("contractType", hasItems("PERMANENT", "CONTRACT"))
      .body("startDate", hasItems("2024-01-15", "2023-06-01"))
      .body("finishDate", hasItem("2024-06-01"))
      .body("onGoing", hasItems(true, false))
      .body("employmentType", hasItems("FULL_TIME", "PART_TIME"))
      .body("hoursPerWeek", hasItems(38, 20))
      .body(matchesJsonSchemaInClasspath("schemas/employee-list-schema.json"));
  }

  //Tests for Creating Employees
  @Test
  public void createEmployee_validDTO_created() {
    String session = adminSession();
    Department department = createDepartment("Engineering");

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(validRequest(department.getId()))
      .when()
      .post("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.CREATED.value())
      .body("employee.firstName", equalTo("validFirstName"))
      .body("employee.lastName", equalTo("validLastName"))
      .body("employee.middleName", equalTo("validMiddleName"))
      .body("employee.email", equalTo("validEmail@gmail.com"))
      .body("employee.phoneNumber", equalTo("0412345678"))
      .body(
        "employee.address",
        equalTo("123 Example Street, Melbourne VIC 3000")
      )
      .body("employee.jobRole", equalTo("Software Engineer"))
      .body("employee.department.name", equalTo("Engineering"))
      .body("employee.contractType", equalTo("CONTRACT"))
      .body("employee.startDate", equalTo("2023-06-01"))
      .body("employee.finishDate", equalTo("2024-06-01"))
      .body("employee.onGoing", equalTo(false))
      .body("employee.employmentType", equalTo("PART_TIME"))
      .body("employee.hoursPerWeek", equalTo(30))
      .body("temporaryPassword", not(emptyOrNullString()))
      .body(
        matchesJsonSchemaInClasspath("schemas/create-employee-schema.json")
      );
  }

  @Test
  public void createEmployee_temporaryPasswordLogsIn() {
    String session = adminSession();
    Department department = createDepartment("Engineering");

    // The whole point of the generated password: the admin can read it off the
    // create response and the new employee can sign in with it.
    String temporaryPassword = given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(validRequest(department.getId()))
      .when()
      .post("/api/employees")
      .then()
      .statusCode(HttpStatus.CREATED.value())
      .extract()
      .path("temporaryPassword");

    assertNotNull(
      temporaryPassword,
      "create should return a temporary password"
    );

    given()
      .contentType(ContentType.JSON)
      .body(
        Map.of("email", "validEmail@gmail.com", "password", temporaryPassword)
      )
      .when()
      .post("/api/auth/login")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.OK.value())
      // the login identity is stored lowercased, so it comes back lowercased
      .body("email", equalTo("validemail@gmail.com"))
      .body("role", equalTo("EMPLOYEE"));
  }

  @Test
  public void createEmployee_mixedCaseEmail_canLogInWithLowercase() {
    String session = adminSession();
    Department department = createDepartment("Engineering");

    CreateEmployeeRequest request = validRequest(department.getId());
    request.setEmail("Jane.Doe@Example.com");

    String temporaryPassword = given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(request)
      .when()
      .post("/api/employees")
      .then()
      .statusCode(HttpStatus.CREATED.value())
      .extract()
      .path("temporaryPassword");

    // The login identity is stored lowercased, so lookup finds it regardless of
    // how the admin typed the address.
    given()
      .contentType(ContentType.JSON)
      .body(
        Map.of("email", "jane.doe@example.com", "password", temporaryPassword)
      )
      .when()
      .post("/api/auth/login")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.OK.value())
      .body("email", equalTo("jane.doe@example.com"));
  }

  @Test
  public void createEmployee_invalidDTO_badRequest() {
    String session = adminSession();

    CreateEmployeeRequest dto = new CreateEmployeeRequest();
    dto.setFirstName("");
    dto.setLastName("");
    dto.setMiddleName(
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );
    dto.setEmail("not-an-email");
    dto.setPhoneNumber("");
    dto.setAddress("");
    dto.setJobRole("");
    dto.setContractType(null);
    dto.setStartDate(null);
    dto.setFinishDate(null);
    dto.setOnGoing(null);
    dto.setEmploymentType(null);
    dto.setHoursPerWeek(-10);

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(dto)
      .when()
      .post("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.BAD_REQUEST.value())
      .body("details.employmentType", hasItem("must not be null"))
      .body("details.firstName", hasItem("must not be blank"))
      .body("details.lastName", hasItem("must not be blank"))
      .body("details.phoneNumber", hasItem("must not be blank"))
      .body(
        "details.hoursPerWeek",
        hasItem("must be greater than or equal to 1")
      )
      .body("details.address", hasItem("must not be blank"))
      .body("details.jobRole", hasItem("must not be blank"))
      .body("details.contractType", hasItem("must not be null"))
      .body("details.middleName", hasItem("size must be between 0 and 50"))
      .body("details.email", hasItem("must be a well-formed email address"))
      .body("details.onGoing", hasItem("must not be null"))
      .body("details.startDate", hasItem("must not be null"))
      .body(matchesJsonSchemaInClasspath("schemas/api-error-schema.json"));
  }

  @Test
  public void createEmployee_duplicateField_returnsConflict() {
    String session = adminSession();
    Department department = createDepartment("Engineering");

    Employee employee1 = new Employee();
    employee1.setFirstName("Jane");
    employee1.setLastName("Doe");
    employee1.setMiddleName("Marie");
    employee1.setEmail("jane.doe@example.com");
    employee1.setPhoneNumber("0412345678");
    employee1.setAddress("123 Example Street, Melbourne VIC 3000");
    employee1.setJobRole("Software Engineer");
    employee1.setContractType(ContractType.PERMANENT);
    employee1.setStartDate(LocalDate.of(2024, 1, 15));
    employee1.setFinishDate(null);
    employee1.setOnGoing(true);
    employee1.setEmploymentType(EmploymentType.FULL_TIME);
    employee1.setHoursPerWeek(38);
    employeeRepository.saveAndFlush(employee1);

    CreateEmployeeRequest employee2 = new CreateEmployeeRequest();
    employee2.setFirstName("John");
    employee2.setLastName("Smith");
    employee2.setMiddleName(null);
    employee2.setEmail("jane.doe@example.com");
    employee2.setPhoneNumber("0498765432");
    employee2.setAddress("456 Sample Ave, Sydney NSW 2000");
    employee2.setJobRole("Sales Manager");
    employee2.setDepartmentId(department.getId());
    employee2.setContractType(ContractType.CONTRACT);
    employee2.setStartDate(LocalDate.of(2023, 6, 1));
    employee2.setFinishDate(LocalDate.of(2024, 6, 1));
    employee2.setOnGoing(false);
    employee2.setEmploymentType(EmploymentType.PART_TIME);
    employee2.setHoursPerWeek(20);

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(employee2)
      .when()
      .post("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.CONFLICT.value())
      .body("status", equalTo(HttpStatus.CONFLICT.value()))
      .body("message", containsString("jane.doe@example.com"))
      .body(matchesJsonSchemaInClasspath("schemas/api-error-schema.json"));
  }

  //Tests for Deleting Employee
  @Test
  public void deleteEmployee_employeeInDB_deleted() {
    String session = adminSession();
    Employee employee1 = persistEmployee("Jane", "jane.doe@example.com");

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + employee1.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.NO_CONTENT.value());
  }

  @Test
  public void deleteTodo_todoNotInDB_NotFound() {
    String session = adminSession();

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/1")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.NOT_FOUND.value())
      .body(matchesJsonSchemaInClasspath("schemas/api-error-schema.json"));
  }

  /**
   * users.employee_id is a foreign key, so deleting an employee that has a
   * login account used to fail with a constraint violation surfaced as a 500.
   */
  @Test
  public void deleteEmployee_employeeHasLoginAccount_deletesAccountToo() {
    String session = adminSession();
    Employee employee = persistEmployee("Linked", "linked@example.com");
    createUser("linked@example.com", Role.EMPLOYEE, employee);

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + employee.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.NO_CONTENT.value());

    Optional<User> orphan = userRepository.findByEmail("linked@example.com");
    assertTrue(
      orphan.isEmpty(),
      "the linked login account should have been deleted with the employee"
    );
  }

  @Test
  public void deleteEmployee_ownEmployeeRecord_returnsUnprocessable() {
    Employee employee = persistEmployee("Admin", "self.admin@example.com");
    createUser(ADMIN_EMAIL, Role.ADMIN, employee);
    String session = login(ADMIN_EMAIL, PASSWORD);

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + employee.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.UNPROCESSABLE_CONTENT.value());
  }

  //Tests for authentication and authorization

  @Test
  public void employeeEndpoints_noSession_returnUnauthorized() {
    given()
      .when()
      .get("/api/employees")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    given()
      .when()
      .get("/api/employees/1")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    given()
      .when()
      .delete("/api/employees/1")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    given()
      .contentType(ContentType.JSON)
      .body(validRequest(1L))
      .when()
      .post("/api/employees")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
  }

  @Test
  public void createEmployee_employeeRole_returnsForbidden() {
    String session = employeeSession();
    Department department = createDepartment("Engineering");

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body(validRequest(department.getId()))
      .when()
      .post("/api/employees")
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.FORBIDDEN.value())
      .body(matchesJsonSchemaInClasspath("schemas/api-error-schema.json"));
  }

  @Test
  public void deleteEmployee_employeeRole_returnsForbidden() {
    String session = employeeSession();
    Employee employee = persistEmployee("Jane", "jane.doe@example.com");

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + employee.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.FORBIDDEN.value());
  }

  @Test
  public void updateEmployee_employeeRole_returnsForbidden() {
    String session = employeeSession();
    Employee employee = persistEmployee("Jane", "jane.doe@example.com");

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body("{\"firstName\":\"Changed\"}")
      .when()
      .put("/api/employees/" + employee.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.FORBIDDEN.value());
  }

  @Test
  public void updateEmployee_adminRole_returnsOk() {
    String session = adminSession();
    Employee employee = persistEmployee("Jane", "jane.doe@example.com");

    given()
      .cookie(SESSION_COOKIE, session)
      .contentType(ContentType.JSON)
      .body("{\"firstName\":\"Changed\"}")
      .when()
      .put("/api/employees/" + employee.getId())
      .then()
      .log()
      .body()
      .statusCode(HttpStatus.OK.value())
      .body("firstName", equalTo("Changed"));
  }
}
