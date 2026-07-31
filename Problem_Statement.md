

Problem statement · MD
Problem Statement
1. Title
Government Grievance Redressal Portal

2. Domain
Civic Tech / e-Governance

3. Who is the user? (2–3 user types, with roles)
Citizen — registers, submits grievances against municipal issues, tracks status, gives feedback after resolution.
GRO (Grievance Redressal Officer) — logs in to a department-specific dashboard, views a prioritized queue of grievances assigned to their department, updates status, and logs resolution actions.
4. What problem are we solving? (3–5 sentences, real-life example)
Citizens who notice civic issues — a broken streetlight, a contaminated water supply, an unrepaired pothole — currently have no single, trackable channel to report them. Complaints get lost across phone calls, in-person visits to the wrong department, or informal social media posts, with no way to check status or hold anyone accountable. For example, a resident reporting a leaking water pipe today has no tracking ID, no visibility into which department is handling it, and no way to know if it has even been assigned to anyone. This project gives citizens a single portal to file, track, and receive resolution updates on civic grievances, while giving municipal officers a structured queue instead of an inbox of scattered complaints.

5. Proposed Solution (what the application will do, feature-wise)
Citizen registration/login (JWT-based auth).
Citizen submits a grievance as free-text + optional category, which is auto-classified by department and priority using an AI model (Phase 3 specialization).
Citizen dashboard: view all submitted grievances, live status, tracking ID, resolution history, and submit feedback/rating once resolved.
GRO registration/login, scoped to one Department.
GRO dashboard: view a queue of grievances filtered to their department, sorted by priority, update status (Pending → In Progress → Resolved), and add resolution remarks (ResolutionLog entries).
Admin-level visibility (optional, can fold into GRO role if time-constrained): department-wise grievance counts/analytics.
Email or SMS notification on status change (satisfies the "3rd-party integration" acceptance criterion — pick one; email via a free SMTP/SendGrid sandbox is the simpler build).
6. Core Entities / Database Tables (list all, minimum 5)
User — stores both Citizens and GROs, differentiated by a role field; GROs additionally reference a Department.
Department — municipal bodies (e.g. Water Board, Electricity, Roads) that grievances get routed to.
Grievance — the complaint ticket: description text, AI-predicted department, AI-predicted priority, current status, tracking ID, submitting Citizen (FK), assigned Department (FK).
ResolutionLog — one or more entries per Grievance, logging each action/remark a GRO makes (FK to Grievance, FK to GRO/User).
Feedback — Citizen's satisfaction rating and appeal status once a Grievance is marked Resolved (FK to Grievance).
7. User Roles & Permissions (minimum 2 distinct roles)
Role	Can do
CITIZEN	Register/login, submit grievances, view own grievances + status, submit feedback on resolved grievances
GRO	Login (department-scoped), view grievance queue for own department, update grievance status, add resolution log entries
8. Success Criteria
A citizen should be able to submit a new grievance and receive a tracking ID in under 1 minute.
A GRO should be able to view their department's pending queue, sorted by priority, in a single dashboard load.
A citizen should be able to check the live status of any past grievance using their tracking ID within 2 clicks of logging in.
9. Out of Scope
Payment processing (no payments involved in grievance filing).
Real-time chat between citizen and GRO (status updates + remarks only, not live messaging).
Mobile native apps (web-responsive only, via React).
Multi-language support (English only for this build).
GIS/map-based location pinning of grievances (may be considered as a future enhancement, not in the 60-day scope).
10. Chosen Track
Java (Spring Boot 3.x, Java 17)


