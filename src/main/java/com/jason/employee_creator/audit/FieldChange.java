package com.jason.employee_creator.audit;

public record FieldChange(String field, Object oldValue, Object newValue) {}
