# Employee Creator

A full-stack app for managing employees and departments: a Spring Boot REST API backed by MySQL, with a React frontend.

## Architecture

- **Backend** (repo root): Spring Boot 4.1.1 / Java 17, package-by-feature under `src/main/java/com/jason/employee_creator/` (`employee/`, `department/`, `common/` for shared exceptions and error handling, `config/` for security, CORS and ModelMapper setup, `user/` and `auth/` for authentication). Persistence via Spring Data JPA/Hibernate against MySQL (H2 in-memory for tests). REST endpoints are exposed at `/api/employees` and `/api/departments`.
- **Frontend** (`employee-creator-frontend/`): React 19 + TypeScript, built with Vite. Server state is managed with React Query, forms with react-hook-form + Zod, styling with CSS Modules/SCSS.

## Prerequisites

- Java 17
- Node.js (for the frontend)
- A running MySQL instance (or adjust `spring.datasource.url` in `src/main/resources/application.properties` to point at your own)

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

## Authentication

Session-cookie authentication via Spring Security. Logging in returns a `JSESSIONID`
cookie that must be sent with every subsequent request; browsers only do this
cross-origin when the client sets `credentials: "include"` on its requests.

| Endpoint | Access |
| --- | --- |
| `POST /api/auth/login` | Public. Body `{ "email": "...", "password": "..." }`. Returns the current user; 401 on bad credentials. |
| `POST /api/auth/logout` | Invalidates the session. |
| `GET /api/me` | Any authenticated user. Returns `userId`, `email`, `role`, `employeeId`. |
| `GET /api/employees`, `GET /api/departments` (and `/{id}`) | Any authenticated user. |
| `POST`, `PUT`, `PATCH`, `DELETE` on employees and departments | `ADMIN` only. |

Roles are `ADMIN` and `EMPLOYEE`, enforced with `@PreAuthorize("hasRole('ADMIN')")`
on the service methods. Unauthenticated requests get 401, authenticated
non-admins get 403.

Deleting an employee also deletes their linked login account, since
`users.employee_id` is a foreign key. An admin cannot delete their own employee
record.

### Demo users

`DataSeeder` runs only under the `dev` profile (active by default locally) and
only when the `users` table is empty:

| Email | Password | Role |
| --- | --- | --- |
| `admin@demo.com` | `admin123` | `ADMIN` |
| `bob@demo.com` | `password123` | `EMPLOYEE` |
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
npm run build   # type-check and build for production
npm run lint    # run ESLint
```

## Continuous integration

[![CI](https://github.com/TheJsun/employee-creator/actions/workflows/ci.yml/badge.svg)](https://github.com/TheJsun/employee-creator/actions/workflows/ci.yml)

`.github/workflows/ci.yml` runs on every pull request into `main` and on pushes
to `main`. Two jobs run in parallel:

| Job | Runs |
| --- | --- |
| Backend (Java 17) | `./mvnw -B -ntp verify` — compiles, runs all tests, packages the jar |
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

### Not yet covered

- No frontend test runner (no Vitest/RTL, no test files) — the frontend job gates lint and types only
- No backend coverage reporting (no JaCoCo)
- No formatter check (no Prettier or `.editorconfig`)
- `strict` is not enabled in the TypeScript config, so `tsc -b` is a weaker gate than it appears

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
ephemeral storage.

For a split-domain deploy instead (SPA on a static host), build the frontend with
`VITE_API_URL` set to the API's absolute URL, set `app.cors.allowed-origins` to
the SPA origin, and change the prod session cookie to `same-site=none`.

### Single-VM stack (Oracle Cloud Always Free)

`docker-compose.prod.yml` runs the whole thing on one box: the app (from the GHCR
image), a `mysql:8` container with a persistent `db_data` volume, and a **Caddy**
reverse proxy that terminates HTTPS. TLS is **required**, not optional — the prod
session cookie is `Secure`, so login silently fails over plain `http://`. Caddy
obtains a Let's Encrypt certificate automatically, which needs a real hostname
(the free DuckDNS subdomain `spring-staff.duckdns.org`) pointed at the VM's IP,
not a bare address. Behind the proxy the app sets
`server.forward-headers-strategy=framework` so `LoginRateLimiter` sees the real
client IP.

On the VM: clone the repo, copy `.env.example` to `.env` and fill it in (it is
git-ignored), then:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

#### First admin

Prod starts with an empty `users` table (`DataSeeder` is dev-only), so
`BootstrapAdminSeeder` creates the first `ADMIN` **only** when
`APP_BOOTSTRAP_ADMIN_EMAIL` + `APP_BOOTSTRAP_ADMIN_PASSWORD` are set *and* the
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
admin, and its own URL. The steps below stand one up from scratch. The free
reference host is an **Oracle Cloud Always Free** VM, but any Docker host works.

**You'll need:** a Docker host with the Docker Engine + Compose plugin installed; a
hostname you control pointing at it (a free [DuckDNS](https://www.duckdns.org)
subdomain is fine); and ports **80** and **443** reachable. Budget ~15–20 minutes.

1. **Get the files onto the host.** Clone this repo (or your fork) onto the host —
   you need `docker-compose.prod.yml`, `Caddyfile`, and `.env.example`:
   ```bash
   git clone <your-repo-url> employee-creator && cd employee-creator
   ```

2. **Point a hostname at the host.** Create a DNS record (e.g. a DuckDNS subdomain
   like `my-team.duckdns.org`) resolving to the host's public IP. Open ingress for
   ports **80** and **443** in *both* your cloud firewall/security list **and** the
   OS firewall (Oracle images block these by default). HTTPS is mandatory — the prod
   session cookie is `Secure`, so login fails over plain `http://`.

3. **Use *your* hostname in two places** (the repo ships the author's placeholder
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
   `ghcr.io/thejsun/employee-creator:latest` (this project's image). For your own
   copy either:
   - **Build from source on the host** (fully self-contained) — add `build: .` under
     the `app` service (keeping or removing `image:`), then `docker compose -f
     docker-compose.prod.yml up -d --build`. Note the multi-stage build needs enough
     RAM (comfortable on an Ampere A1; tight on a 1 GB micro VM).
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

**Automating redeploys (optional):** wire up CD as above against *your* registry and
host — set the `SSH_*` and `DEPLOY_URL` repository secrets and point the image name
at your own package. Without it, deploying an update is just `git pull && docker
compose -f docker-compose.prod.yml up -d --build` on the host.
