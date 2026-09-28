package com.securepay.common;

import com.securepay.auth.EmailAlreadyExistsException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.securepay.auth.InvalidCredentialsException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateEmail(
            EmailAlreadyExistsException exception
    ) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "EMAIL_ALREADY_EXISTS");
        body.put("message", exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException exception
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error -> fieldErrors.putIfAbsent(
                        error.getField(),
                        error.getDefaultMessage()
                ));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "VALIDATION_FAILED");
        body.put("message", "Please correct the invalid request fields");
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity
                .badRequest()
                .body(body);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(
            InvalidCredentialsException exception
    ) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("error", "INVALID_CREDENTIALS");
        body.put("message", exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(body);
    }
}