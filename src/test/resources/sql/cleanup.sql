-- Delete in foreign-key order: documents/users.employee_id -> employees.department_id
DELETE FROM documents;
DELETE FROM users;
DELETE FROM employees;
DELETE FROM department;
