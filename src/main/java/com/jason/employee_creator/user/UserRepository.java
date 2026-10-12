package com.jason.employee_creator.user;

import com.jason.employee_creator.user.entities.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
  Optional<User> findByEmployeeId(Long employeeId);
}
