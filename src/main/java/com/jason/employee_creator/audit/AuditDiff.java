package com.jason.employee_creator.audit;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.data.annotation.Id;

public final class AuditDiff {

  private AuditDiff() {}

  public static Map<String, Object> snapshot(Object entity) {
    Map<String, Object> values = new LinkedHashMap<>();
    for (Field field : entity.getClass().getDeclaredFields()) {
      if (
        Modifier.isStatic(field.getModifiers()) ||
        field.isAnnotationPresent(NotAudited.class) ||
        field.isAnnotationPresent(Id.class) ||
        Collection.class.isAssignableFrom(field.getType())
      ) {
        continue;
      }
      field.setAccessible(true);
      try {
        Object value = field.get(entity);

        values.put(
          field.getName(),
          value instanceof Auditable related ? related.auditLabel() : value
        );
      } catch (IllegalAccessException e) {
        throw new IllegalStateException(e);
      }
    }

    return values;
  }

  public static List<FieldChange> diff(
    Map<String, Object> before,
    Map<String, Object> after
  ) {
    List<FieldChange> changes = new ArrayList<>();
    for (String field : after.keySet()) {
      Object oldValue = before.get(field);
      Object newValue = after.get(field);
      if (!valuesEqual(oldValue, newValue)) {
        changes.add(new FieldChange(field, oldValue, newValue));
      }
    }
    return changes;
  }

  private static boolean valuesEqual(Object a, Object b) {
    if (a instanceof BigDecimal x && b instanceof BigDecimal y) return (
      x.compareTo(y) == 0
    );
    return Objects.equals(a, b);
  }
}
