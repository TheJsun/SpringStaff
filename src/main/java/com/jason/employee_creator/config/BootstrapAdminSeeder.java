package com.jason.employee_creator.config;

import com.jason.employee_creator.user.Emails;
import com.jason.employee_creator.user.Role;
import com.jason.employee_creator.user.UserRepository;
import com.jason.employee_creator.user.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapAdminSeeder implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(
    BootstrapAdminSeeder.class
  );

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final String adminEmail;
  private final String adminPassword;

  public BootstrapAdminSeeder(
    UserRepository userRepository,
    PasswordEncoder passwordEncoder,
    @Value("${app.bootstrap.admin.email:}") String adminEmail,
    @Value("${app.bootstrap.admin.password:}") String adminPassword
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.adminEmail = adminEmail;
    this.adminPassword = adminPassword;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (adminEmail.isBlank() || adminPassword.isBlank()) {
      return;
    }
    if (userRepository.count() > 0) {
      log.info("Bootstrap admin skipped: users table is not empty.");
      return;
    }

    String email = Emails.normalise(adminEmail);
    userRepository.save(
      new User(email, passwordEncoder.encode(adminPassword), Role.ADMIN, null)
    );
    log.warn(
      "Bootstrap admin created for {}. Remove APP_BOOTSTRAP_ADMIN_* from the " +
        "environment and change this password after first login.",
      email
    );
  }
}
