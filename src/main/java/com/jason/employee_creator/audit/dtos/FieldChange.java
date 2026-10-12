package com.jason.employee_creator.audit.dtos;

public record FieldChange(String field, Object oldValue, Object newValue) {}
