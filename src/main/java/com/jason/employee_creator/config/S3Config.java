package com.jason.employee_creator.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

  @Bean
  S3Client s3Client(
    @Value("${app.s3.region}") String region,
    @Value("${app.s3.profile:}") String profile
  ) {
    S3ClientBuilder builder = S3Client.builder().region(Region.of(region));
    if (!profile.isBlank()) {
      builder.credentialsProvider(ProfileCredentialsProvider.create(profile));
    }
    return builder.build();
  }

  @Bean
  S3Presigner s3Presigner(@Value("${app.s3.region}") String region) {
    return S3Presigner.builder().region(Region.of(region)).build();
  }
}
