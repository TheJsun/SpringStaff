package com.jason.employee_creator.document;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;

import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.support.ApiIntegrationTest;
import com.jason.employee_creator.user.Role;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

public class DocumentAuthorizationTest extends ApiIntegrationTest {

  private static final byte[] PDF_BYTES =
    "%PDF-1.4 fake pdf content".getBytes(StandardCharsets.UTF_8);

  private String ownerSession(Employee owner, String loginEmail) {
    createUser(loginEmail, Role.EMPLOYEE, owner);
    return login(loginEmail, PASSWORD);
  }

  @Test
  public void documentEndpoints_noSession_returnUnauthorized() {
    given()
      .when()
      .get("/api/employees/1/documents")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    given()
      .multiPart("file", "contract.pdf", PDF_BYTES, "application/pdf")
      .multiPart("name", "Employment contract")
      .when()
      .post("/api/employees/1/documents")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    given()
      .when()
      .delete("/api/employees/1/documents/1")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
  }

  @Test
  public void owner_canUploadListDownloadAndDeleteOwnDocuments() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    String session = ownerSession(owner, "owner.login@example.com");

    Integer documentId = given()
      .cookie(SESSION_COOKIE, session)
      .multiPart("file", "contract.pdf", PDF_BYTES, "application/pdf")
      .multiPart("name", "Employment contract")
      .when()
      .post("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.CREATED.value())
      .body("name", equalTo("Employment contract"))
      .body("fileName", equalTo("contract.pdf"))
      .body("uploadedByName", equalTo("Owner Tester"))
      .extract()
      .path("id");

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .get("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.OK.value())
      .body("$", hasSize(1))
      .body("[0].name", equalTo("Employment contract"));

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .get("/api/employees/" + owner.getId() + "/documents/" + documentId + "/content")
      .then()
      .statusCode(HttpStatus.OK.value())
      .contentType("application/pdf");

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + owner.getId() + "/documents/" + documentId)
      .then()
      .statusCode(HttpStatus.NO_CONTENT.value());
  }

  @Test
  public void otherEmployee_cannotAccessAnothersDocuments() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    Employee other = persistEmployee("Other", "other@example.com");
    ownerSession(owner, "owner.login@example.com");
    String otherSession = ownerSession(other, "other.login@example.com");

    given()
      .cookie(SESSION_COOKIE, otherSession)
      .when()
      .get("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.FORBIDDEN.value());

    given()
      .cookie(SESSION_COOKIE, otherSession)
      .multiPart("file", "contract.pdf", PDF_BYTES, "application/pdf")
      .multiPart("name", "Sneaky upload")
      .when()
      .post("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.FORBIDDEN.value());
  }

  @Test
  public void admin_canUploadToAnyEmployee() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    String session = adminSession();

    given()
      .cookie(SESSION_COOKIE, session)
      .multiPart("file", "contract.pdf", PDF_BYTES, "application/pdf")
      .multiPart("name", "Employment contract")
      .when()
      .post("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.CREATED.value())
      .body("name", equalTo("Employment contract"));
  }

  @Test
  public void upload_unsupportedContentType_returnsUnprocessable() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    String session = ownerSession(owner, "owner.login@example.com");

    given()
      .cookie(SESSION_COOKIE, session)
      .multiPart("file", "notes.txt", "hello".getBytes(StandardCharsets.UTF_8), "text/plain")
      .multiPart("name", "Random notes")
      .when()
      .post("/api/employees/" + owner.getId() + "/documents")
      .then()
      .statusCode(HttpStatus.UNPROCESSABLE_CONTENT.value());
  }
}
