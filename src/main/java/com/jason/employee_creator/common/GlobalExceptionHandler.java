package com.jason.employee_creator.common;

import com.jason.employee_creator.common.dtos.ApiErrorResponse;
import com.jason.employee_creator.common.exceptions.DepartmentInUseException;
import com.jason.employee_creator.common.exceptions.DuplicateFieldException;
import com.jason.employee_creator.common.exceptions.NotFoundException;
import com.jason.employee_creator.common.exceptions.UnprocessableContentException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleNotFoundException(
    NotFoundException ex,
    HttpServletRequest req
  ) {
    log.warn("Not found exception: {}", ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.NOT_FOUND,
      ex.getMessage(),
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(DuplicateFieldException.class)
  public ResponseEntity<ApiErrorResponse> handleduplicateFieldException(
    DuplicateFieldException ex,
    HttpServletRequest req
  ) {
    log.warn("Duplicate email conflict: {}", ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.CONFLICT,
      ex.getMessage(),
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(UnprocessableContentException.class)
  public ResponseEntity<ApiErrorResponse> handleUnprocessableContentException(
    UnprocessableContentException ex,
    HttpServletRequest req
  ) {
    log.warn("Unprocessable content exception: {}", ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.UNPROCESSABLE_CONTENT,
      ex.getMessage(),
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_CONTENT);
  }

  @ExceptionHandler(DepartmentInUseException.class)
  public ResponseEntity<ApiErrorResponse> handleDepartmentInUseException(
    DepartmentInUseException ex,
    HttpServletRequest req
  ) {
    log.warn("Department in use conflict: {}", ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.CONFLICT,
      ex.getMessage(),
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ApiErrorResponse> handleMaxUploadSizeExceededException(
    MaxUploadSizeExceededException ex,
    HttpServletRequest req
  ) {
    log.warn("Upload too large on {}: {}", req.getRequestURI(), ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.PAYLOAD_TOO_LARGE,
      "File exceeds the maximum size of 10 MB",
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.PAYLOAD_TOO_LARGE);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValidException(
    MethodArgumentNotValidException ex,
    HttpServletRequest req
  ) {
    log.warn("Invalid method argument: {}", ex.getMessage());
    Map<String, ArrayList<String>> errors = new HashMap<>();

    for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
      String field = fieldError.getField();
      String message = fieldError.getDefaultMessage();

      errors.computeIfAbsent(field, k -> new ArrayList<>()).add(message);
    }
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.BAD_REQUEST,
      ex.getMessage(),
      req.getRequestURI(),
      errors
    );
    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
    AuthenticationException ex,
    HttpServletRequest req
  ) {
    log.warn(
      "Authentication failed on {}: {}",
      req.getRequestURI(),
      ex.getMessage()
    );
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.UNAUTHORIZED,
      "Invalid email or password",
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
    AccessDeniedException ex,
    HttpServletRequest req
  ) {
    log.warn("Access denied on {}: {}", req.getRequestURI(), ex.getMessage());
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.FORBIDDEN,
      "You do not have permission to perform this action",
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpected(
    Exception ex,
    HttpServletRequest req
  ) {
    log.warn("Unhandled exception: {}", ex.getMessage(), ex);
    ApiErrorResponse response = ApiErrorResponse.of(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred",
      req.getRequestURI()
    );
    return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
