package com.jason.employee_creator.department.dtos;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateDepartmentRequest {

  @Pattern(regexp = ".*\\S.*", message = "Name cannot be empty")
  private String name;

  @Size(max = 255)
  private String description;

  private Long leadId;

  public UpdateDepartmentRequest() {}

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Long getLeadId() {
    return leadId;
  }

  public void setLeadId(Long leadId) {
    this.leadId = leadId;
  }
}
