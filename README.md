# Lightweight Agent-Based Infrastructure Monitoring System

## Project Layout
- `backend/` Spring Boot backend service
- `infra/` local infrastructure files (Docker Compose)
- `docs/` architecture and setup notes

## Backend Quick Start
1. Install prerequisites:
   - Java 21+
   - Docker Desktop
2. Start PostgreSQL:
   ```bash
   cd /Users/barkanuzun/Downloads/498monitoring/infra
   docker compose up -d
   ```
3. Run backend:
   ```bash
   cd /Users/barkanuzun/Downloads/498monitoring/backend
   ./mvnw spring-boot:run
   ```
4. Check health endpoint:
   ```bash
   curl http://localhost:8080/actuator/health
   ```
