# Entity-Relationship (ER) Diagram — v1

> Versioned at: Day 11 (this version). Updated at Day 41 and Day 60.
> PK/FK shown per entity, per Section 7.2 of the master doc.

```mermaid
erDiagram
    DEPARTMENT ||--o{ USER : "employs (GRO only)"
    DEPARTMENT ||--o{ GRIEVANCE : "handles"
    USER ||--o{ GRIEVANCE : "files (as Citizen)"
    USER ||--o{ RESOLUTION_LOG : "writes (as GRO)"
    GRIEVANCE ||--o{ RESOLUTION_LOG : "has"
    GRIEVANCE ||--o| FEEDBACK : "receives"

    DEPARTMENT {
        bigint id PK
        string name
        string description
    }

    USER {
        bigint id PK
        string name
        string email
        string password_hash
        string role "CITIZEN or GRO"
        bigint department_id FK "nullable, only for GRO"
        datetime created_at
    }

    GRIEVANCE {
        bigint id PK
        string tracking_id
        bigint citizen_id FK
        string description
        bigint department_id FK "AI-predicted or GRO-reassigned"
        string priority "AI-predicted: LOW/MEDIUM/HIGH"
        string status "PENDING/IN_PROGRESS/RESOLVED"
        datetime created_at
        datetime updated_at
    }

    RESOLUTION_LOG {
        bigint id PK
        bigint grievance_id FK
        bigint gro_id FK
        string remarks
        string action_taken
        datetime logged_at
    }

    FEEDBACK {
        bigint id PK
        bigint grievance_id FK
        int rating "1-5"
        string comment
        boolean is_appealed
        datetime submitted_at
    }
```

## Relationship summary
| Relationship | Type | Notes |
|---|---|---|
| Department → User (GRO) | One-to-Many | A department can have many GROs; a GRO belongs to exactly one department |
| Department → Grievance | One-to-Many | A department handles many grievances |
| User (Citizen) → Grievance | One-to-Many | A citizen can file many grievances |
| Grievance → ResolutionLog | One-to-Many | A grievance can accumulate multiple resolution actions over time |
| User (GRO) → ResolutionLog | One-to-Many | A GRO can log many resolution entries across grievances |
| Grievance → Feedback | One-to-One | Feedback is submitted once, after resolution |

## Alternative: DBML source (for dbdiagram.io, the doc's suggested tool)
Paste the block below into https://dbdiagram.io to get an auto-laid-out ER diagram + exportable PNG.

```dbml
Table department {
  id bigint [pk, increment]
  name varchar
  description varchar
}

Table user {
  id bigint [pk, increment]
  name varchar
  email varchar [unique]
  password_hash varchar
  role varchar // CITIZEN or GRO
  department_id bigint [ref: > department.id, note: 'nullable, GRO only']
  created_at datetime
}

Table grievance {
  id bigint [pk, increment]
  tracking_id varchar [unique]
  citizen_id bigint [ref: > user.id]
  description text
  department_id bigint [ref: > department.id]
  priority varchar // LOW / MEDIUM / HIGH
  status varchar // PENDING / IN_PROGRESS / RESOLVED
  created_at datetime
  updated_at datetime
}

Table resolution_log {
  id bigint [pk, increment]
  grievance_id bigint [ref: > grievance.id]
  gro_id bigint [ref: > user.id]
  remarks text
  action_taken varchar
  logged_at datetime
}

Table feedback {
  id bigint [pk, increment]
  grievance_id bigint [ref: - grievance.id]
  rating int
  comment text
  is_appealed boolean
  submitted_at datetime
}
```