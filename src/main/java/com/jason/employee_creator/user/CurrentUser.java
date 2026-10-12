package com.jason.employee_creator.user;

import com.jason.employee_creator.user.entities.User;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class CurrentUser implements UserDetails {

  private final Long id;
  private final String email;
  private final String passwordHash;
  private final Role role;
  private final Long employeeId;

  public CurrentUser(User user) {
    this.id = user.getId();
    this.email = user.getEmail();
    this.passwordHash = user.getPassword();
    this.role = user.getRole();
    this.employeeId =
      user.getEmployee() == null ? null : user.getEmployee().getId();
  }

  public Long getId() {
    return id;
  }

  public Role getRole() {
    return role;
  }

  public Long getEmployeeId() {
    return employeeId;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public String getPassword() {
    return passwordHash;
  }

  @Override
  public String getUsername() {
    return email;
  }
}
