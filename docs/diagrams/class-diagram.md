# Class / Module Diagram — v1

> Versioned at: Day 11 (this version). Updated at Day 41 and Day 60.
> Must match your actual code (Section 7.3) — keep this in sync as you build, don't let it drift.

```mermaid
classDiagram
    class GrievanceController {
        +submitGrievance(GrievanceRequestDto) ResponseEntity
        +getMyGrievances() ResponseEntity
        +getGrievanceById(id) ResponseEntity
    }
    class GroController {
        +getDepartmentQueue() ResponseEntity
        +updateStatus(id, StatusUpdateDto) ResponseEntity
        +addResolutionLog(id, ResolutionLogDto) ResponseEntity
    }
    class AuthController {
        +register(RegisterDto) ResponseEntity
        +login(LoginDto) ResponseEntity
    }
    class FeedbackController {
        +submitFeedback(grievanceId, FeedbackDto) ResponseEntity
    }

    class GrievanceService {
        -GrievanceRepository grievanceRepo
        -ClassificationService classificationService
        +createGrievance(dto, citizenId) Grievance
        +getGrievancesForCitizen(citizenId) List~Grievance~
        +getQueueForDepartment(deptId) List~Grievance~
        +updateStatus(id, status) Grievance
    }
    class ClassificationService {
        +predictDepartment(text) Department
        +predictPriority(text) String
    }
    class ResolutionService {
        -ResolutionLogRepository resolutionRepo
        +logAction(grievanceId, groId, remarks) ResolutionLog
    }
    class FeedbackService {
        -FeedbackRepository feedbackRepo
        +submitFeedback(grievanceId, rating, comment) Feedback
    }
    class AuthService {
        -UserRepository userRepo
        -PasswordEncoder encoder
        -JwtProvider jwtProvider
        +register(dto) User
        +login(dto) String
    }

    class GrievanceRepository {
        <<interface>>
        +findByCitizenId(id) List~Grievance~
        +findByDepartmentId(id) List~Grievance~
    }
    class ResolutionLogRepository {
        <<interface>>
        +findByGrievanceId(id) List~ResolutionLog~
    }
    class FeedbackRepository {
        <<interface>>
        +findByGrievanceId(id) Feedback
    }
    class UserRepository {
        <<interface>>
        +findByEmail(email) User
    }
    class DepartmentRepository {
        <<interface>>
        +findById(id) Department
    }

    class User {
        -Long id
        -String name
        -String email
        -String passwordHash
        -Role role
        -Department department
    }
    class Grievance {
        -Long id
        -String trackingId
        -User citizen
        -String description
        -Department department
        -String priority
        -String status
    }
    class ResolutionLog {
        -Long id
        -Grievance grievance
        -User gro
        -String remarks
    }
    class Feedback {
        -Long id
        -Grievance grievance
        -int rating
        -String comment
    }
    class Department {
        -Long id
        -String name
    }

    GrievanceController --> GrievanceService
    GroController --> GrievanceService
    GroController --> ResolutionService
    AuthController --> AuthService
    FeedbackController --> FeedbackService

    GrievanceService --> GrievanceRepository
    GrievanceService --> ClassificationService
    ResolutionService --> ResolutionLogRepository
    FeedbackService --> FeedbackRepository
    AuthService --> UserRepository

    GrievanceRepository --> Grievance
    ResolutionLogRepository --> ResolutionLog
    FeedbackRepository --> Feedback
    UserRepository --> User
    DepartmentRepository --> Department

    Grievance --> User : citizen
    Grievance --> Department
    ResolutionLog --> Grievance
    ResolutionLog --> User : gro
    Feedback --> Grievance
    User --> Department : "GRO only"
```