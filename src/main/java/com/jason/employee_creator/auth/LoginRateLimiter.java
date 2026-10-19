package com.jason.employee_creator.auth;

import com.jason.employee_creator.common.exceptions.TooManyAttemptsException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class LoginRateLimiter {

  static final int MAX_FAILURES = 5;
  static final Duration LOCKOUT = Duration.ofMinutes(15);

  private record Attempt(int failures, Instant firstFailure) {}

  private final ConcurrentHashMap<String, Attempt> attempts =
    new ConcurrentHashMap<>();

  public void checkAllowed(String key) {
    Attempt attempt = attempts.get(key);
    if (attempt == null) {
      return;
    }
    boolean windowExpired = Instant.now().isAfter(
      attempt.firstFailure().plus(LOCKOUT)
    );
    if (windowExpired) {
      attempts.remove(key);
      return;
    }
    if (attempt.failures() >= MAX_FAILURES) {
      throw new TooManyAttemptsException(
        "Too many failed login attempts. Try again later."
      );
    }
  }

  public void recordFailure(String key) {
    attempts.compute(key, (k, existing) -> {
      Instant now = Instant.now();
      if (
        existing == null || now.isAfter(existing.firstFailure().plus(LOCKOUT))
      ) {
        return new Attempt(1, now);
      }
      return new Attempt(existing.failures() + 1, existing.firstFailure());
    });
  }

  public void reset(String key) {
    attempts.remove(key);
  }
}
