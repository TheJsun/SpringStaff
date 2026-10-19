package com.jason.employee_creator.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  // On in dev/prod; disabled under test so the existing REST-assured suite
  // (which does not send CSRF tokens) keeps passing. A dedicated test enables
  // it to verify enforcement.
  @Value("${app.security.csrf.enabled:true}")
  private boolean csrfEnabled;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
    throws Exception {
    http
      .authorizeHttpRequests(auth ->
        auth
          .requestMatchers("/api/auth/login")
          .permitAll()
          // Health probe for container platforms and the CD smoke test.
          .requestMatchers("/actuator/health", "/actuator/health/**")
          .permitAll()
          // Everything under the API requires authentication...
          .requestMatchers("/api/**")
          .authenticated()
          // ...while static SPA assets and client-side routes are public (the
          // SPA itself gates content by calling /api/me). Harmless for a
          // split-domain deployment, where nothing but the API is served here.
          .anyRequest()
          .permitAll()
      )
      .cors(Customizer.withDefaults())
      .securityContext(context ->
        context.securityContextRepository(securityContextRepository())
      )
      .exceptionHandling(ex ->
        ex.authenticationEntryPoint(
          new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
        )
      )
      .logout(logout ->
        logout
          .logoutUrl("/api/auth/logout")
          .invalidateHttpSession(true)
          .clearAuthentication(true)
          .deleteCookies("JSESSIONID")
          .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
      );

    if (csrfEnabled) {
      // SPA-friendly CSRF: the token is stored in a JS-readable XSRF-TOKEN
      // cookie and echoed back by the frontend as an X-XSRF-TOKEN header on
      // mutating requests. SameSite=Lax session cookies already block most
      // cross-site writes; this is defense-in-depth and a hard requirement for
      // a split-domain deployment.
      CsrfTokenRequestAttributeHandler requestHandler =
        new CsrfTokenRequestAttributeHandler();
      // Validate the raw token straight from the header (opt out of the
      // deferred/BREACH-encoded token, which a stateless SPA cannot supply).
      requestHandler.setCsrfRequestAttributeName(null);
      http
        .csrf(csrf ->
          csrf
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            .csrfTokenRequestHandler(requestHandler)
        )
        // Force the CsrfToken to be loaded so the XSRF-TOKEN cookie is written
        // on every response, including the initial unauthenticated GET /api/me.
        .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class);
    } else {
      http.csrf(AbstractHttpConfigurer::disable);
    }

    return http.build();
  }

  /**
   * Causes the deferred {@link CsrfToken} to be resolved on each request so the
   * {@code XSRF-TOKEN} cookie is sent to the browser even when nothing else
   * renders the token (e.g. the login page's priming request).
   */
  static final class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
    ) throws ServletException, IOException {
      CsrfToken csrfToken = (CsrfToken) request.getAttribute(
        CsrfToken.class.getName()
      );
      if (csrfToken != null) {
        csrfToken.getToken();
      }
      filterChain.doFilter(request, response);
    }
  }

  @Bean
  public SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  public SessionAuthenticationStrategy sessionAuthenticationStrategy() {
    return new ChangeSessionIdAuthenticationStrategy();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public AuthenticationManager authenticationManager(
    AuthenticationConfiguration config
  ) throws Exception {
    return config.getAuthenticationManager();
  }
}
