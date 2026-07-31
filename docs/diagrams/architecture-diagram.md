# System Architecture Diagram — v1


```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        A[React Frontend<br/>Tailwind CSS + Axios]
    end

    subgraph Hosting_FE["Hosting: Vercel / Netlify"]
        A
    end

    subgraph Backend["Backend / API Layer"]
        B[Spring Boot 3.x App<br/>Java 17]
        B1[Spring Security + JWT]
        B2["/api/auth"]
        B3["/api/grievances"]
        B4["/api/departments"]
        B5["/api/resolutions"]
        B6["/api/feedback"]
        B7["AI Classification Module<br/>(Day 42-60 specialization)"]
    end

    subgraph Hosting_BE["Hosting: Render / Railway"]
        B
    end

    subgraph DataLayer["Database Layer"]
        D[(MySQL 8 / PostgreSQL 15)]
    end

    subgraph Hosting_DB["Hosting: Railway / Clever Cloud / Aiven"]
        D
    end

    subgraph External["External Services"]
        E[Email/SMS Notification Service<br/>e.g. SendGrid sandbox]
    end

    A -- "HTTPS / REST JSON" --> B
    B --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B3 --> B5
    B3 --> B6
    B3 -.->|"Phase 3"| B7
    B -- "Spring Data JPA / Hibernate" --> D
    B -- "on status change" --> E
```

## Layer notes
- **Client**: React SPA, calls backend only via versioned REST endpoints, holds JWT in memory/localStorage.
- **Backend/API**: Spring Boot monolith (single deployable) — controller → service → repository layering, as per Section 6.5 of the master doc.
- **Database**: single relational DB, 5 core entities with FK relationships (see ER diagram).
- **External service**: notification dispatch on grievance status change — satisfies the "≥1 third-party integration" acceptance criterion.
- **Hosting boundary**: frontend and backend are deployed to *separate* platforms — this must be explicitly shown per Section 7.1.