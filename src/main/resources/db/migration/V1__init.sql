CREATE TABLE department (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    lead_id     BIGINT,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE employees (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    middle_name     VARCHAR(50),
    email           VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(255) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    job_role        VARCHAR(50) NOT NULL,
    contract_type   ENUM('CONTRACT','PERMANENT') NOT NULL,
    employment_type ENUM('FULL_TIME','PART_TIME') NOT NULL,
    start_date      DATE NOT NULL,
    finish_date     DATE,
    on_going        BIT NOT NULL,
    hours_per_week  INTEGER NOT NULL,
    department_id   BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT uk_employees_email UNIQUE (email),
    CONSTRAINT ck_employees_hours CHECK ((hours_per_week <= 168) AND (hours_per_week >= 1))
) ENGINE=InnoDB;

CREATE TABLE users (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('ADMIN','EMPLOYEE') NOT NULL,
    employee_id BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_employee UNIQUE (employee_id)
) ENGINE=InnoDB;

CREATE TABLE documents (
    id                   BIGINT NOT NULL AUTO_INCREMENT,
    name                 VARCHAR(255) NOT NULL,
    file_name            VARCHAR(255) NOT NULL,
    content_type         VARCHAR(255) NOT NULL,
    size_bytes           BIGINT NOT NULL,
    data                 LONGBLOB NOT NULL,
    employee_id          BIGINT NOT NULL,
    uploaded_by_user_id  BIGINT NOT NULL,
    uploaded_by_name     VARCHAR(255) NOT NULL,
    uploaded_at          DATETIME(6) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE audit_log (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    actor_id     BIGINT,
    actor_email  VARCHAR(255),
    action       ENUM('CREATED','DELETED','UPDATED'),
    entity_type  VARCHAR(255),
    entity_id    BIGINT,
    entity_label VARCHAR(255),
    details      LONGTEXT,
    created_at   DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_log (created_at);

ALTER TABLE department
    ADD CONSTRAINT fk_department_lead FOREIGN KEY (lead_id) REFERENCES employees (id);
ALTER TABLE employees
    ADD CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES department (id);
ALTER TABLE users
    ADD CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees (id);
ALTER TABLE documents
    ADD CONSTRAINT fk_documents_employee FOREIGN KEY (employee_id) REFERENCES employees (id);
