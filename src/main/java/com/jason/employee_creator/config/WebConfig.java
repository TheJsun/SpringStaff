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
    @Value(
      "${app.cors.allowed-origins:http://localhost:5173}"
    ) String[] allowedOrigins
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
