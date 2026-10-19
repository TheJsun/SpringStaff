package com.jason.employee_creator.config;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final String[] allowedOrigins;

  public WebConfig(
    @Value("${app.cors.allowed-origins:http://localhost:5173}") String[] allowedOrigins
  ) {
    this.allowedOrigins = allowedOrigins;
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
      .addMapping("/api/**")
      .allowedOrigins(allowedOrigins)
      .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
      .allowedHeaders("*")
      .allowCredentials(true);
  }

  /**
   * Single-page-app fallback for a same-origin deployment: the built SPA is
   * served from classpath:/static (the Docker build copies it there). Requests
   * that match a real static file are served as-is; client-side routes such as
   * /employees/5 fall back to index.html so a deep link or page refresh works.
   * API and actuator paths are never rewritten — they 404 normally if unmapped.
   *
   * <p>In local dev there is no bundled SPA (the frontend runs on Vite), so this
   * resolver simply finds nothing and requests 404 — harmless.
   */
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
      .addResourceHandler("/**")
      .addResourceLocations("classpath:/static/")
      .resourceChain(true)
      .addResolver(
        new PathResourceResolver() {
          @Override
          protected Resource getResource(String resourcePath, Resource location)
            throws IOException {
            Resource requested = location.createRelative(resourcePath);
            if (requested.exists() && requested.isReadable()) {
              return requested;
            }
            if (
              resourcePath.startsWith("api/") ||
              resourcePath.startsWith("actuator/")
            ) {
              return null;
            }
            Resource index = new ClassPathResource("/static/index.html");
            return index.exists() ? index : null;
          }
        }
      );
  }
}
