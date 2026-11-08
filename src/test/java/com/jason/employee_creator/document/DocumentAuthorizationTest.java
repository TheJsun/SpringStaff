package com.jason.employee_creator.document;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.jason.employee_creator.employee.entities.Employee;
import com.jason.employee_creator.support.ApiIntegrationTest;
import com.jason.employee_creator.user.Role;
import io.restassured.http.ContentType;
import io.restassured.response.ValidatableResponse;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

public class DocumentAuthorizationTest extends ApiIntegrationTest {

  private static final String UPLOAD_URL = "https://s3.test/upload";
  private static final String DOWNLOAD_URL = "https://s3.test/download";
  private static final String FILE_NAME = "contract.pdf";
  private static final long SIZE_BYTES = 1234L;

  @MockitoBean
  private S3StorageService storageService;

  @BeforeEach
  public void stubStorage() {
    when(storageService.presignUpload(anyString(), anyString(), anyLong()))
      .thenReturn(UPLOAD_URL);
    when(storageService.presignDownload(anyString(), anyString(), anyString()))
      .thenReturn(DOWNLOAD_URL);
    when(storageService.head(anyString())).thenReturn(
      Optional.of(
        HeadObjectResponse.builder()
          .contentLength(SIZE_BYTES)
          .contentType("application/pdf")
          .build()
      )
    );
  }

  private String ownerSession(Employee owner, String loginEmail) {
    createUser(loginEmail, Role.EMPLOYEE, owner);
    return login(loginEmail, PASSWORD);
  }

  private RequestSpecification withSession(String session) {
    RequestSpecification spec = given();
    return session == null ? spec : spec.cookie(SESSION_COOKIE, session);
  }

  private ValidatableResponse requestUploadUrl(
    String session,
    Long employeeId,
    String contentType
  ) {
    return withSession(session)
      .contentType(ContentType.JSON)
      .body(
        Map.of(
          "fileName",
          FILE_NAME,
          "contentType",
          contentType,
          "sizeBytes",
          SIZE_BYTES
        )
      )
      .when()
      .post("/api/employees/" + employeeId + "/documents/upload-url")
      .then();
  }

  private ValidatableResponse confirmUpload(
    String session,
    Long employeeId,
    String key,
    String name
  ) {
    return withSession(session)
      .contentType(ContentType.JSON)
      .body(Map.of("s3Key", key, "name", name, "fileName", FILE_NAME))
      .when()
      .post("/api/employees/" + employeeId + "/documents")
      .then();
  }

  private String uploadKey(String session, Long employeeId) {
    return requestUploadUrl(session, employeeId, "application/pdf")
      .statusCode(HttpStatus.OK.value())
      .body("key", startsWith("employees/" + employeeId + "/"))
      .body("uploadUrl", equalTo(UPLOAD_URL))
      .extract()
      .path("key");
  }

  @Test
  public void documentEndpoints_noSession_returnUnauthorized() {
    given()
      .when()
      .get("/api/employees/1/documents")
      .then()
      .statusCode(HttpStatus.UNAUTHORIZED.value());
    requestUploadUrl(null, 1L, "application/pdf").statusCode(
      HttpStatus.UNAUTHORIZED.value()
    );
    confirmUpload(
      null,
      1L,
      "employees/1/abc",
      "Employment contract"
    ).statusCode(HttpStatus.UNAUTHORIZED.value());
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

    String key = uploadKey(session, owner.getId());

    Integer documentId = confirmUpload(
      session,
      owner.getId(),
      key,
      "Employment contract"
    )
      .statusCode(HttpStatus.CREATED.value())
      .body("name", equalTo("Employment contract"))
      .body("fileName", equalTo(FILE_NAME))
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
      .redirects()
      .follow(false)
      .when()
      .get(
        "/api/employees/" + owner.getId() + "/documents/" + documentId + "/content"
      )
      .then()
      .statusCode(HttpStatus.FOUND.value())
      .header("Location", equalTo(DOWNLOAD_URL));

    given()
      .cookie(SESSION_COOKIE, session)
      .when()
      .delete("/api/employees/" + owner.getId() + "/documents/" + documentId)
      .then()
      .statusCode(HttpStatus.NO_CONTENT.value());

    verify(storageService).delete(key);
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

    requestUploadUrl(
      otherSession,
      owner.getId(),
      "application/pdf"
    ).statusCode(HttpStatus.FORBIDDEN.value());

    confirmUpload(
      otherSession,
      owner.getId(),
      "employees/" + owner.getId() + "/sneaky",
      "Sneaky upload"
    ).statusCode(HttpStatus.FORBIDDEN.value());
  }

  @Test
  public void admin_canUploadToAnyEmployee() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    String session = adminSession();

    String key = uploadKey(session, owner.getId());

    confirmUpload(session, owner.getId(), key, "Employment contract")
      .statusCode(HttpStatus.CREATED.value())
      .body("name", equalTo("Employment contract"));
  }

  @Test
  public void upload_unsupportedContentType_returnsUnprocessable() {
    Employee owner = persistEmployee("Owner", "owner@example.com");
    String session = ownerSession(owner, "owner.login@example.com");

    requestUploadUrl(session, owner.getId(), "text/plain").statusCode(
      HttpStatus.UNPROCESSABLE_CONTENT.value()
    );
  }
}
