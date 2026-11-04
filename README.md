# Employee Creator

A full-stack app for managing employees and departments: a Spring Boot REST API backed by MySQL, with a React frontend. Employee documents are stored in AWS S3.

## Architecture

- **Backend** (repo root): Spring Boot 4.1.1 / Java 17, package-by-feature under `src/main/java/com/jason/employee_creator/` (`employee/`, `department/`, `common/` for shared exceptions and error handling, `config/` for security, CORS and ModelMapper setup, `user/` and `auth/` for authentication). Persistence via Spring Data JPA/Hibernate against MySQL (H2 in-memory for tests). Document files live in an S3 bucket (`document/`, `config/S3Config.java`); MySQL holds only their metadata. REST endpoints are exposed at `/api/employees`, `/api/employees/{id}/documents` and `/api/departments`.
- **Frontend** (`employee-creator-frontend/`): React 19 + TypeScript, built with Vite. Server state is managed with React Query, forms with react-hook-form + Zod, styling with CSS Modules/SCSS.

## Prerequisites

- Java 17
- Node.js (for the frontend)
- A running MySQL instance (or adjust `spring.datasource.url` in `src/main/resources/application.properties` to point at your own)
- An AWS account with an S3 bucket and credentials for it (see [Document storage (S3)](#document-storage-s3))

## Configuration profiles

Config is split by Spring profile:

- `application.properties` — profile-neutral base (no datasource, no active
  profile, no secrets).
- `application-dev.properties` — local MySQL, verbose SQL, demo seeder. The
  `spring-boot-maven-plugin` activates `dev` so `./mvnw spring-boot:run` uses it.
- `application-prod.properties` — everything from the environment, SQL logging
  off, `Secure` session cookie. Activated by `SPRING_PROFILES_ACTIVE=prod` (the
  Docker image sets this).

The packaged jar carries **no** default profile, so it cannot accidentally boot
as `dev`. `DataSeeder` is `@Profile("dev")` and never runs in prod.

## Running the backend

```bash
export DB_USERNAME=root
export DB_PASSWORD=your-password
./mvnw spring-boot:run
```

`DB_USERNAME` / `DB_PASSWORD` are not committed. The schema `employee_creator`
must exist; Flyway creates the tables (see Database migrations below).

Document features also need AWS credentials. Put them in `~/.aws/credentials`
(see [Document storage (S3)](#document-storage-s3)); the app starts without
them, but presigning document URLs fails.

Tests run with:

```bash
./mvnw test
```

## Database migrations

Flyway owns the schema (`src/main/resources/db/migration/`), and Hibernate is set
to `validate` — it never alters a live schema. Change an entity ⇒ add a new
`V<n>__description.sql` migration; `validate` will fail loudly if the entities and
tables drift. Under test, Flyway is disabled and H2 is created by Hibernate
(`create-drop`).

`V1__init.sql` was generated from the entities by Hibernate (MySQL dialect) so it
matches `validate` exactly. **Verify once against a fresh MySQL before the first
prod deploy** (this environment had no MySQL to run it against):

```bash
# against an empty throwaway schema
SPRING_PROFILES_ACTIVE=prod \
  DB_URL=jdbc:mysql://localhost:3306/employee_creator_fresh \
  DB_USERNAME=... DB_PASSWORD=... APP_CORS_ALLOWED_ORIGINS=http://localhost \
  ./mvnw spring-boot:run
# success = Flyway applies V1 and Hibernate "validate" passes with no error
```

`V2__documents_s3.sql` moves document storage to S3: it **deletes all existing
documents**, drops the `data` `LONGBLOB` column and adds a unique `s3_key`
column. Documents uploaded before V2 are not migrated.

## Authentication

Session-cookie authentication via Spring Security. Logging in returns a `JSESSIONID`
cookie that must be sent with every subsequent request; browsers only do this
cross-origin when the client sets `credentials: "include"` on its requests.

| Endpoint                                                      | Access                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/login`                                        | Public. Body `{ "email": "...", "password": "..." }`. Returns the current user; 401 on bad credentials. |
| `POST /api/auth/logout`                                       | Invalidates the session.                                                                                |
| `GET /api/me`                                                 | Any authenticated user. Returns `userId`, `email`, `role`, `employeeId`.                                |
| `GET /api/employees`, `GET /api/departments` (and `/{id}`)    | Any authenticated user.                                                                                 |
| `POST`, `PUT`, `PATCH`, `DELETE` on employees and departments | `ADMIN` only.                                                                                           |

Roles are `ADMIN` and `EMPLOYEE`, enforced with `@PreAuthorize("hasRole('ADMIN')")`
on the service methods. Unauthenticated requests get 401, authenticated
non-admins get 403.

Deleting an employee also deletes their linked login account, since
`users.employee_id` is a foreign key. An admin cannot delete their own employee
record.

### Demo users

`DataSeeder` runs only under the `dev` profile (active by default locally) and
only when the `users` table is empty:

| Email            | Password      | Role       |
| ---------------- | ------------- | ---------- |
| `admin@demo.com` | `admin123`    | `ADMIN`    |
| `bob@demo.com`   | `password123` | `EMPLOYEE` |
| `alice@demo.com` | `password123` | `EMPLOYEE` |

These are throwaway development credentials. Do not run the `dev` profile
against anything you care about.

### CSRF protection

CSRF is enabled (`SecurityConfig`, toggled by `app.security.csrf.enabled`, on in
dev/prod and off under test). Spring Security stores the token in a JS-readable
`XSRF-TOKEN` cookie; the frontend's `apiFetch` wrapper (`src/api/http.ts`)
reflects it back as an `X-XSRF-TOKEN` header on every mutating request. A
`CsrfCookieFilter` forces the cookie to be issued on the first `GET /api/me`, so
it is present before the login form is submitted. `CsrfEnforcementTest` proves a
tokenless mutation is rejected with `403` and a token-carrying one succeeds.

### Login rate limiting

`POST /api/auth/login` is throttled by `LoginRateLimiter` (per client IP +
email): 5 failed attempts trigger a 15-minute lockout returning `429`. State is
in-memory, which is correct for a single instance; scaling horizontally would
require moving it to a shared store (e.g. Redis). Behind a proxy/load balancer,
set `server.forward-headers-strategy=framework` so the real client IP is used.

## Document storage (S3)

Document files are stored in a private S3 bucket. The `documents` table holds only
metadata (name, file name, type, size, uploader) and the object's `s3_key`. File
bytes never pass through the Spring app: the browser talks to S3 directly using
short-lived (5-minute) **presigned URLs**, while the API keeps doing the
authorization (`@PreAuthorize`: admin, or the document's own employee),
validation and audit logging.

- **Download:** `GET /api/employees/{id}/documents/{documentId}/content` checks
  access, then responds `302 Found` with a presigned S3 GET URL in `Location`.
  The browser follows it automatically; the URL sets the response content type
  and an `inline` disposition so PDFs and images open in the browser.
- **Upload (in progress):** the planned flow is (1) the client requests a
  presigned PUT URL from the API, which validates type and size and chooses the
  object key `employees/{employeeId}/{uuid}`; (2) the browser `PUT`s the file
  straight to S3; (3) the client confirms with the API, which checks the object
  really exists in S3 (and its real size) before saving the `documents` row. Until
  this lands, uploads fail because nothing sets `s3_key`.

S3 access is wrapped in `document/S3StorageService.java`. The `S3Client` and
`S3Presigner` beans in `config/S3Config.java` use the AWS SDK's default
credentials chain, so no keys are configured in the app itself.

| Property        | Default             | Meaning                             |
| --------------- | ------------------- | ----------------------------------- |
| `app.s3.region` | `us-east-1`         | Region of the bucket                |
| `app.s3.bucket` | `springstaff-files` | Bucket that stores document objects |

Both can be overridden with environment variables (`APP_S3_REGION`,
`APP_S3_BUCKET`). Keep the bucket in the same region as the EC2 host.

### AWS setup

1. **Bucket:** create it with **Block all public access** left on. Presigned URLs
   work against a private bucket.
2. **Bucket CORS** (Permissions → CORS). Without this the browser's direct `PUT`
   to S3 fails its preflight:

   ```json
   [
     {
       "AllowedOrigins": ["https://springstaff.duckdns.org", "http://localhost:5173"],
       "AllowedMethods": ["PUT", "GET"],
       "AllowedHeaders": ["Content-Type"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

3. **Permissions policy:** create one customer-managed policy (e.g.
   `springstaff-s3-access`) and attach it to both identities below:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::springstaff-files/*"
       }
     ]
   }
   ```

   A presigned URL carries the permissions of whoever signed it, so the app's
   identity needs these actions for the URLs to work.

4. **Credentials:** you need one **IAM role** for production and one **IAM user**
   for local development.
   - **Production (EC2):** an IAM role with EC2 as its trusted entity, attached to
     the instance. The SDK picks up temporary, auto-rotating credentials from
     the instance metadata service, so there are no keys in `.env`. Because the app
     runs in a Docker container, raise the metadata hop limit to 2, or the
     container can't reach it ("Unable to load credentials"):

     ```bash
     aws ec2 modify-instance-metadata-options --instance-id <instance-id> \
       --http-endpoint enabled --http-put-response-hop-limit 2
     ```

   - **Local development:** an IAM user with an access key. Put the key in
     `~/.aws/credentials` (or run `aws configure`), which lives outside the repo:

     ```ini
     [default]
     aws_access_key_id = AKIA...
     aws_secret_access_key = ...
     ```

     Environment variables `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` work too.
     Never commit keys; if one leaks, deactivate it in IAM and create a new one.

## Running the frontend

```bash
cd employee-creator-frontend
npm install
npm run dev
```

Configure the API base URL in `employee-creator-frontend/.env`:

```
VITE_API_URL=http://localhost:8080/api
```

Other useful scripts (run from `employee-creator-frontend/`):

```bash
npm run build        # type-check and build for production
npm run lint         # run ESLint
npm test             # run the Vitest suite once
npm run test:watch   # re-run tests on file changes
```

### Frontend tests

Component tests use **Vitest** (jsdom environment, globals enabled) with **React
Testing Library**, `@testing-library/user-event` and `jest-dom` matchers. Config
lives in the `test` block of `employee-creator-frontend/vite.config.ts`. Tests are
co-located with their component as `Component.test.tsx`.

Shared helpers live in `src/test/`:

- `setup.ts` — registers the `jest-dom` matchers and runs `cleanup()` after each test.
- `renderWithProviders.tsx` — renders UI inside `QueryClientProvider` (retries
  off), `AuthContext` and a `MemoryRouter`. Accepts `auth`, `route` and
  `queryClient` options, and exports `makeAuth()` plus `adminUser` / `employeeUser`.
- `fixtures.ts` — typed mock department, employee, document and audit-log responses.

```tsx
renderWithProviders(
  <EmployeeCard employee={mockEmployee} onDelete={vi.fn()} onEdit={vi.fn()} />,
  { auth: makeAuth({ user: adminUser }), route: "/employees" },
);
```

CSS is not processed under test (`css: false`), so SCSS module classes are
stubbed — query by role, text or accessible name, never by class name.

## Continuous integration

[![CI](https://github.com/TheJsun/employee-creator/actions/workflows/ci.yml/badge.svg)](https://github.com/TheJsun/employee-creator/actions/workflows/ci.yml)

`.github/workflows/ci.yml` runs on every pull request into `main` and on pushes
to `main`. Two jobs run in parallel:

| Job                | Runs                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| Backend (Java 17)  | `./mvnw -B -ntp verify` — compiles, runs all tests, packages the jar                        |
| Frontend (Node 24) | `npm ci`, then `npm run lint` and `npm run build` (the build also type-checks via `tsc -b`) |

The backend job needs **no MySQL instance and no secrets**. `src/test/resources/application.properties`
shares its filename with the main config, so on the test classpath it replaces
it entirely — tests run against in-memory H2 with `ddl-auto=create-drop`. That
also means `spring.profiles.active=dev` is absent under test, so `DataSeeder`
does not run and cannot affect assertions.

To reproduce a CI failure locally, run the exact commands above. Note that CI
pins JDK 17 (matching `<java.version>` in `pom.xml`); if you have a newer JDK
installed locally, a green local build does not guarantee a green CI build.

Surefire reports are uploaded as a build artifact on every run, including
failures, so you can download them from the Actions tab instead of reproducing
locally.

## Deployment

The app deploys as a **single same-origin container**: the SPA is built and
bundled into the Spring Boot jar (`classpath:/static`), so one image serves the
UI at `/` and the API at `/api/**`. This keeps the session cookie first-party
(`SameSite=Lax` + CSRF stay simple) and all but removes CORS.

```bash
docker build -t employee-creator .
docker run --rm -p 8080:8080 \
  -e DB_URL="jdbc:mysql://<host>:3306/employee_creator" \
  -e DB_USERNAME=... -e DB_PASSWORD=... \
  -e APP_CORS_ALLOWED_ORIGINS="https://your-domain" \
  employee-creator
```

The image pins `SPRING_PROFILES_ACTIVE=prod` and runs as a non-root user. Point
your platform's health check at `GET /actuator/health` (returns
`{"status":"UP"}`). Provision **managed MySQL** rather than a DB container with
ephemeral storage. The container also needs AWS credentials for document storage.
On EC2 these come from the instance's IAM role; elsewhere, pass
`-e AWS_ACCESS_KEY_ID=... -e AWS_SECRET_ACCESS_KEY=...` (see
[Document storage (S3)](#document-storage-s3)).

For a split-domain deploy instead (SPA on a static host), build the frontend with
`VITE_API_URL` set to the API's absolute URL, set `app.cors.allowed-origins` to
the SPA origin, and change the prod session cookie to `same-site=none`.

### Single-host stack (AWS EC2)

`docker-compose.prod.yml` runs the whole thing on one box: the app (from the GHCR
image), a `mysql:8` container with a persistent `db_data` volume, and a **Caddy**
reverse proxy that terminates HTTPS. TLS is **required**, not optional — the prod
session cookie is `Secure`, so login silently fails over plain `http://`. Caddy
obtains a Let's Encrypt certificate automatically, which needs a real hostname
(the free DuckDNS subdomain `springstaff.duckdns.org`) pointed at the VM's IP,
not a bare address. Behind the proxy the app sets
`server.forward-headers-strategy=framework` so `LoginRateLimiter` sees the real
client IP. Document files are not on the host; they live in S3, and the app
reaches the bucket through the instance's IAM role.

On the instance: clone the repo, copy `.env.example` to `.env` and fill it in (it
is git-ignored), then:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

#### First admin

Prod starts with an empty `users` table (`DataSeeder` is dev-only), so
`BootstrapAdminSeeder` creates the first `ADMIN` **only** when
`APP_BOOTSTRAP_ADMIN_EMAIL` + `APP_BOOTSTRAP_ADMIN_PASSWORD` are set _and_ the
table is empty. Set them in `.env` for the first boot, log in, then blank them
out (the empty-table guard stops it re-running). The admin has no linked employee
record; create a profile later via the UI if wanted.

### Continuous deployment

`.github/workflows/cd.yml` runs after CI succeeds on `main`: it builds a
multi-arch (`amd64` + `arm64`) image and pushes it to GHCR (tagged with the commit
SHA and `latest`), then a `deploy` job SSHes into the VM, runs
`docker compose ... pull && up -d`, and smoke-tests `GET /actuator/health` until
it reports `UP`. Provide `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` and `DEPLOY_URL`
as repository secrets, and make the GHCR package public (or `docker login ghcr.io`
on the VM) so `pull` works.

## Deploy your own copy

This is a **single-tenant, self-hosted** app: there is no shared service to sign up
for — each team runs its own independent instance with its own database, its own
admin, and its own URL. The steps below stand one up from scratch. The reference
host is an **AWS EC2** instance, but any Docker host works.

**You'll need:** a Docker host with the Docker Engine + Compose plugin installed; a
hostname you control pointing at it (a free [DuckDNS](https://www.duckdns.org)
subdomain is fine); ports **80** and **443** reachable; and an S3 bucket for
documents. Budget ~20–30 minutes.

1. **Get the files onto the host.** Clone this repo (or your fork) onto the host —
   you need `docker-compose.prod.yml`, `Caddyfile`, and `.env.example`:

   ```bash
   git clone <your-repo-url> employee-creator && cd employee-creator
   ```

2. **Point a hostname at the host.** Create a DNS record (e.g. a DuckDNS subdomain
   like `my-team.duckdns.org`) resolving to the host's public IP. Open ingress for
   ports **80** and **443** in your cloud firewall (on EC2, the instance's security
   group) and in the OS firewall if it has one. HTTPS is mandatory — the prod
   session cookie is `Secure`, so login fails over plain `http://`.

   **Set up document storage.** Create the S3 bucket, its CORS rule (with
   `https://<your-hostname>` as an allowed origin) and the permissions policy, as
   described in [AWS setup](#aws-setup). On EC2, attach the IAM role to the
   instance and set the metadata hop limit to 2. On any other host, put
   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` in `.env` and pass them through
   in the `app` service's `environment:` block in `docker-compose.prod.yml`. If
   your bucket isn't `springstaff-files` in `us-east-1`, pass `APP_S3_BUCKET` /
   `APP_S3_REGION` the same way.

3. **Use _your_ hostname in two places** (the repo ships the author's placeholder
   `spring-staff.duckdns.org` — replace it):
   - `Caddyfile` — change the site address to your hostname.
   - `.env` — set `APP_CORS_ALLOWED_ORIGINS` to `https://<your-hostname>` (next step).

4. **Create your `.env`** from the template and fill in real values:

   ```bash
   cp .env.example .env
   # edit .env: DB_USERNAME/DB_PASSWORD (your choice), APP_CORS_ALLOWED_ORIGINS,
   # and APP_BOOTSTRAP_ADMIN_EMAIL/APP_BOOTSTRAP_ADMIN_PASSWORD for the first admin
   ```

   `.env` is git-ignored and stays only on this host — never commit it.

5. **Choose an image source.** `docker-compose.prod.yml` references
   `ghcr.io/thejsun/springstaff:latest` (this project's image). For your own
   copy either:
   - **Build from source on the host** (fully self-contained) — add `build: .` under
     the `app` service (keeping or removing `image:`), then `docker compose -f
docker-compose.prod.yml up -d --build`. Note the multi-stage build needs enough
     RAM (comfortable with 2 GB or more; tight on a 1 GB instance such as a `t3.micro`).
   - **Or** push your own built image to your own registry and point the `image:`
     line at it.

6. **Launch:**

   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

   On first start, MySQL initialises the `db_data` volume, Flyway applies the schema,
   the app creates your bootstrap admin, and Caddy fetches a TLS certificate.

7. **Verify and secure:**
   ```bash
   curl -fsS https://<your-hostname>/actuator/health   # -> {"status":"UP"}
   ```
   Open `https://<your-hostname>`, log in with the bootstrap admin credentials, then
   **remove** `APP_BOOTSTRAP_ADMIN_*` from `.env` and re-run `up -d` (the empty-table
   guard already stops the seeder re-running, but don't leave the password lying in
   `.env`).

**Automating redeploys (optional):** wire up CD as above against _your_ registry and
host — set the `SSH_*` and `DEPLOY_URL` repository secrets and point the image name
at your own package. Without it, deploying an update is just `git pull && docker
compose -f docker-compose.prod.yml up -d --build` on the host.
