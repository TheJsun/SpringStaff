package com.jason.employee_creator.employee.entities;

import com.jason.employee_creator.audit.Auditable;
import com.jason.employee_creator.department.entities.Department;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee implements Auditable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank
  @Column(nullable = false, length = 50)
  @Size(max = 50)
  private String firstName;

  @NotBlank
  @Column(nullable = false, length = 50)
  @Size(max = 50)
  private String lastName;

  @Column(length = 50)
  @Size(max = 50)
  private String middleName;

  @NotBlank
  @Email
  @Column(unique = true, nullable = false)
  private String email;

  @NotBlank
  private String phoneNumber;

  @NotBlank
  private String address;

  @NotBlank
  @Column(nullable = false, length = 50)
  @Size(max = 50)
  private String jobRole;

  @NotNull
  @Enumerated(EnumType.STRING)
  private ContractType contractType;

  @NotNull
  private LocalDate startDate;

  private LocalDate finishDate;

  @NotNull
  private Boolean onGoing;

  @NotNull
  @Enumerated(EnumType.STRING)
  private EmploymentType employmentType;

  @NotNull
  @Min(1)
  @Max(168)
  private Integer hoursPerWeek;

  @ManyToOne(fetch = FetchType.LAZY)
  private Department department;

  public Employee() {}

  public Employee(
    @NotBlank @Size(max = 50) String firstName,
    @NotBlank @Size(max = 50) String lastName,
    @Size(max = 50) String middleName,
    @NotBlank @Email String email,
    @NotBlank String phoneNumber,
    @NotBlank String address,
    @NotBlank @Size(max = 50) String jobRole,
    @NotNull ContractType contractType,
    @NotNull LocalDate startDate,
    LocalDate finishDate,
    @NotNull Boolean onGoing,
    @NotNull EmploymentType employmentType,
    @NotNull @Min(1) @Max(168) Integer hoursPerWeek,
    Department department
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.middleName = middleName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.address = address;
    this.jobRole = jobRole;
    this.contractType = contractType;
    this.startDate = startDate;
    this.finishDate = finishDate;
    this.onGoing = onGoing;
    this.employmentType = employmentType;
    this.hoursPerWeek = hoursPerWeek;
    this.department = department;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getMiddleName() {
    return middleName;
  }

  public void setMiddleName(String middleName) {
    this.middleName = middleName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getJobRole() {
    return jobRole;
  }

  public void setJobRole(String jobRole) {
    this.jobRole = jobRole;
  }

  public ContractType getContractType() {
    return contractType;
  }

  public void setContractType(ContractType contractType) {
    this.contractType = contractType;
  }

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }

  public LocalDate getFinishDate() {
    return finishDate;
  }

  public void setFinishDate(LocalDate finishDate) {
    this.finishDate = finishDate;
  }

  public Boolean getOnGoing() {
    return onGoing;
  }

  public void setOnGoing(Boolean onGoing) {
    this.onGoing = onGoing;
  }

  public EmploymentType getEmploymentType() {
    return employmentType;
  }

  public void setEmploymentType(EmploymentType employmentType) {
    this.employmentType = employmentType;
  }

  public Integer getHoursPerWeek() {
    return hoursPerWeek;
  }

  public void setHoursPerWeek(Integer hoursPerWeek) {
    this.hoursPerWeek = hoursPerWeek;
  }

  public Department getDepartment() {
    return department;
  }

  public void setDepartment(Department department) {
    this.department = department;
  }

  public String auditLabel() {
    return firstName + " " + lastName;
  }
}
