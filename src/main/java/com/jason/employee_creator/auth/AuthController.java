package com.jason.employee_creator.auth;

import com.jason.employee_creator.user.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

  public record LoginRequest(
    @NotBlank String email,
    @NotBlank String password
  ) {}

  public record MeResponse(
    Long userId,
    String email,
    String role,
    Long employeeId
  ) {
    static MeResponse from(CurrentUser user) {
      return new MeResponse(
        user.getId(),
        user.getUsername(),
        user.getRole().name(),
        user.getEmployeeId()
      );
    }
  }

  private final AuthenticationManager authenticationManager;
  private final SecurityContextRepository securityContextRepository;
  private final SessionAuthenticationStrategy sessionAuthenticationStrategy;
  private final LoginRateLimiter loginRateLimiter;

  public AuthController(
    AuthenticationManager authenticationManager,
    SecurityContextRepository securityContextRepository,
    SessionAuthenticationStrategy sessionAuthenticationStrategy,
    LoginRateLimiter loginRateLimiter
  ) {
    this.authenticationManager = authenticationManager;
    this.securityContextRepository = securityContextRepository;
    this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
    this.loginRateLimiter = loginRateLimiter;
  }

  @PostMapping("/auth/login")
  public MeResponse login(
    @Valid @RequestBody LoginRequest request,
    HttpServletRequest httpRequest,
    HttpServletResponse httpResponse
  ) {
    String rateLimitKey =
      httpRequest.getRemoteAddr() +
      ":" +
      request.email().toLowerCase();
    loginRateLimiter.checkAllowed(rateLimitKey);

    Authentication unauthenticated =
      UsernamePasswordAuthenticationToken.unauthenticated(
        request.email(),
        request.password()
      );

    Authentication authenticated;
    try {
      authenticated = authenticationManager.authenticate(unauthenticated);
    } catch (AuthenticationException ex) {
      loginRateLimiter.recordFailure(rateLimitKey);
      throw ex;
    }
    loginRateLimiter.reset(rateLimitKey);

    sessionAuthenticationStrategy.onAuthentication(
      authenticated,
      httpRequest,
      httpResponse
    );

    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authenticated);
    securityContextRepository.saveContext(context, httpRequest, httpResponse);

    return MeResponse.from((CurrentUser) authenticated.getPrincipal());
  }

  @GetMapping("/me")
  public MeResponse me(@AuthenticationPrincipal CurrentUser currentUser) {
    return MeResponse.from(currentUser);
  }
}
