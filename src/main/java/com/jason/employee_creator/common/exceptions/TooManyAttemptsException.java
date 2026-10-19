package com.jason.employee_creator.common.exceptions;

public class TooManyAttemptsException extends RuntimeException {

  public TooManyAttemptsException(String message) {
    super(message);
  }
}
