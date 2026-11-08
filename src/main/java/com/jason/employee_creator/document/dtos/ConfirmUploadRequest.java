package com.jason.employee_creator.document.dtos;

import jakarta.validation.constraints.NotBlank;

public record ConfirmUploadRequest(
  @NotBlank String s3Key,
  @NotBlank String name,
  @NotBlank String fileName
) {}
