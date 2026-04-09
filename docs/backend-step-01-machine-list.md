# Backend Step 01 - Machine List Flow

## Goal
Implement the first end-to-end backend feature:
- Read machines from DB
- Return them via REST API

Endpoint:
- `GET /api/v1/machines`

## Request Flow (important for presentation)
1. HTTP request reaches `MachineController`.
2. Controller delegates business logic to `MachineService`.
3. Service fetches entities from `MachineRepository`.
4. Repository uses JPA/Hibernate to query PostgreSQL `machines` table.
5. Service maps entities to `MachineResponse` DTO.
6. Controller returns JSON response.

## Files and Responsibilities
- `machine/domain/Machine.java`: JPA entity mapped to `machines` table.
- `machine/domain/MachineStatus.java`: enum for `ONLINE` and `OFFLINE`.
- `machine/repo/MachineRepository.java`: DB access abstraction.
- `machine/service/MachineService.java`: business/use-case layer.
- `machine/api/MachineResponse.java`: API response model.
- `machine/api/MachineController.java`: REST endpoint.
- `auth/config/SecurityConfig.java`: temporary open access for early development.

## Why this structure
- Controller stays thin (HTTP only).
- Service contains business logic.
- Repository contains persistence logic.
- Entity and API DTO are separated to avoid leaking DB model directly.

## Run and Test
1. Start PostgreSQL:
   `cd infra && docker compose up -d`
2. Start backend:
   `cd backend && ./mvnw spring-boot:run`
3. Call API:
   `curl http://localhost:8080/api/v1/machines`
