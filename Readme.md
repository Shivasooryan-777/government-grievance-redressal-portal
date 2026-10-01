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
```

### Frontend Environment Variables (see `frontend/.env.example`)
```
VITE_API_BASE_URL=http://localhost:8080
```

## 6. API Documentation
Once running, visit `/swagger-ui.html` for the full auto-generated API contract (method, path, auth requirement, request/response format for every endpoint).

## 7. Core Entities
User, Department, Grievance, ResolutionLog, Feedback — see [ER Diagram](./docs/diagrams/er-diagram.md) for relationships.

## 8. Roles
| Role | Access |
|---|---|
| CITIZEN | Submit grievances, track status, submit feedback |
| GRO | Department-scoped queue, update status, log resolutions |

## 9. License
MIT — see [LICENSE](./LICENSE).