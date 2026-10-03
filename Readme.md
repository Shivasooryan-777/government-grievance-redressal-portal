# Government Grievance Redressal Portal

> A full-stack civic-tech platform where citizens submit and track municipal grievances, and Grievance Redressal Officers (GROs) manage resolutions — with AI-based complaint classification and priority prediction (Phase 3 specialization).

## 1. Overview
Citizens currently have no single trackable channel to report civic issues like broken streetlights, water contamination, or potholes. This portal lets citizens file a grievance, receive a tracking ID, and follow its status through to resolution — while GROs get a structured, priority-sorted queue instead of scattered complaints. See [`Problem_Statement.md`](./Problem_Statement.md) for full scope.

## 2. Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS + Axios |
| Backend | Spring Boot 3.x (Java 17), Spring Security + JWT |
| ORM / Data Layer | Spring Data JPA + Hibernate |
| Database | PostgreSQL 15 |
| Build Tool | Maven |
| Testing | JUnit 5 |
| API Docs | springdoc-openapi (Swagger UI) |
| CI/CD | GitHub Actions |
| Hosting | Backend: Render/Railway · Frontend: Vercel/Netlify · DB: Railway/Clever Cloud/Aiven |

## 3. Project Status
- [x] Day 1: Problem statement finalized
- [ ] Day 11: Review-I (MVP)
- [ ] Day 41: Review-II (Full product, live)
- [ ] Day 60: Review-III (Enhancement — AI classification)

## 4. Architecture & Design
- [Architecture Diagram](./docs/diagrams/architecture-diagram.md)
- [ER Diagram](./docs/diagrams/er-diagram.md)
- [Class/Module Diagram](./docs/diagrams/class-diagram.md)

## 5. How to Run Locally

### Prerequisites
- Java 17 (JDK)
- Maven 3.9+
- Node.js 18+ and npm
- PostgreSQL 15 running locally

### Backend
```bash
cd backend
cp .env.example .env      # fill in DB credentials, JWT secret
mvn clean install
mvn spring-boot:run
```
Backend runs at `http://localhost:8080`. Swagger UI at `http://localhost:8080/swagger-ui.html`.

### Frontend
```bash
cd frontend
cp .env.example .env      # configure VITE_API_BASE_URL if backend is not on port 8080
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` (or as configured).

### Backend Environment Variables (see `backend/.env.example`)
```
DB_URL=jdbc:postgresql://localhost:5432/grievance_db
DB_USERNAME=postgres
DB_PASSWORD=
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
JWT_SECRET=
JWT_EXPIRATION_MS=86400000
GRO_DEFAULT_PASSWORD=GroPassword123!
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@grievanceportal.gov
```

| Variable | Description | Required | Default |
|---|---|---|---|
| `DB_URL` | JDBC URL for PostgreSQL database | Yes | `jdbc:postgresql://localhost:5432/grievance_db` |
| `DB_USERNAME` | Database username | Yes | `postgres` |
| `DB_PASSWORD` | Database password | Yes | - |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | No | `http://localhost:5173,http://localhost:3000` |
| `JWT_SECRET` | Base64-encoded secret key (≥256-bit) for JWT signing | Yes | Configured in application.yml |
| `JWT_EXPIRATION_MS` | JWT validity window in milliseconds | No | `86400000` (24 hours) |
| `GRO_DEFAULT_PASSWORD` | Default password used by `DataSeeder` for seeded GRO departmental accounts | No | `GroPassword123!` |
| `MAIL_HOST` | Brevo SMTP relay hostname | No | `smtp-relay.brevo.com` |
| `MAIL_PORT` | SMTP port with STARTTLS | No | `587` |
| `MAIL_USERNAME` | Brevo SMTP login email | Yes (for delivery) | - |
| `MAIL_PASSWORD` | Brevo SMTP key generated from dashboard | Yes (for delivery) | - |
| `MAIL_FROM_ADDRESS` | Sender email address (must match Brevo verified sender) | No | `noreply@grievanceportal.gov` |

### Email Notifications (Brevo Free SMTP Relay Setup)
Email notifications are sent asynchronously on grievance status changes and resolution appeals using Brevo's free SMTP relay (300 emails/day free tier). To configure real email delivery:
1. **Sign Up**: Create a free account at [brevo.com](https://www.brevo.com/) (formerly Sendinblue).
2. **Verify Sender**: In your Brevo dashboard, navigate to **Senders & IP** &rarr; **Senders** and verify your sender email address.
3. **Generate SMTP Key**: Navigate to **SMTP & API** &rarr; **SMTP** tab. Copy your SMTP login email and click **Generate a new SMTP key** to create an SMTP password.
4. **Configure `.env`**: Set `MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM_ADDRESS` (matching your verified sender) in `backend/.env`.

> **Failure Isolation:** Email delivery is fully asynchronous and isolated. If credentials are left blank, invalid, or Brevo is unreachable, an SLF4J error is logged and the grievance status update transaction proceeds without error.

### Frontend Environment Variables (see `frontend/.env.example`)
```
VITE_API_BASE_URL=http://localhost:8080
```

## 6. API Documentation
Once running, visit `/swagger-ui.html` for the full auto-generated API contract (method, path, auth requirement, request/response format for every endpoint).

## 7. Continuous Integration (CI)

Automated testing is configured via GitHub Actions in [`.github/workflows/backend-ci.yml`](./.github/workflows/backend-ci.yml):
- **Triggers**: Runs on every direct `push` to `main` and on every `pull_request` targeting the `main` branch.
- **Environment**: Ubuntu (`ubuntu-latest`) runner with Eclipse Temurin JDK 17 and automated Maven dependency caching keyed to `backend/pom.xml`.
- **Workflow Scope**: Executes `mvn -B test` inside the `backend/` directory to run all 27 JUnit 5 & Mockito unit tests and generate JaCoCo coverage reports.
- **Zero Secrets Required**: All external dependencies (database repositories, Brevo SMTP mail sender) are mocked with Mockito; no database service containers or repository secrets are needed.
- **Failure Blocking**: Any test assertion failure immediately fails the workflow (red ❌), preventing broken pull requests from merging into `main`.
- **Viewing Runs**: Workflow execution runs, build logs, and status checks can be monitored in the **Actions** tab at the top of the GitHub repository, or within the "Checks" section of any open Pull Request.

### Running Tests Locally
To execute the complete unit test suite and generate JaCoCo coverage reports locally:
```bash
cd backend
mvn test
```
The HTML coverage report will be generated at `backend/target/site/jacoco/index.html`.

## 8. Core Entities
User, Department, Grievance, ResolutionLog, Feedback — see [ER Diagram](./docs/diagrams/er-diagram.md) for relationships.

## 9. Roles
| Role | Access |
|---|---|
| CITIZEN | Submit grievances, track status, submit feedback |
| GRO | Department-scoped queue, update status, log resolutions |

## 10. License
MIT — see [LICENSE](./LICENSE).