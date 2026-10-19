package com.jason.employee_creator.auth;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.jason.employee_creator.support.ApiIntegrationTest;
import com.jason.employee_creator.user.Role;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "app.security.csrf.enabled=true")
public class CsrfEnforcementTest extends ApiIntegrationTest {

  @Test
  public void mutatingRequest_withoutCsrfToken_isForbidden() {
    createUser(ADMIN_EMAIL, Role.ADMIN, null);

    given()
      .contentType(ContentType.JSON)
      .body(Map.of("email", ADMIN_EMAIL, "password", PASSWORD))
      .when()
      .post("/api/auth/login")
      .then()
      .statusCode(HttpStatus.FORBIDDEN.value());
  }

  @Test
  public void mutatingRequest_withCsrfTokenFromCookie_succeeds() {
    createUser(ADMIN_EMAIL, Role.ADMIN, null);

    Response primer = given().when().get("/api/me");
    String csrfToken = primer.getCookie("XSRF-TOKEN");
    assertNotNull(csrfToken, "GET should set the XSRF-TOKEN cookie");

    given()
      .contentType(ContentType.JSON)
      .cookie("XSRF-TOKEN", csrfToken)
      .header("X-XSRF-TOKEN", csrfToken)
      .body(Map.of("email", ADMIN_EMAIL, "password", PASSWORD))
      .when()
      .post("/api/auth/login")
      .then()
      .statusCode(HttpStatus.OK.value())
      .cookie(SESSION_COOKIE, notNullValue());
  }
}
