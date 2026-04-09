# Backend Setup Notes

## Prerequisites
- Java 21 or newer
- Docker Desktop (for PostgreSQL)

## Database
PostgreSQL runs with Docker Compose from `infra/docker-compose.yml`.

Default credentials:
- Database: `monitoring`
- Username: `monitoring_user`
- Password: `monitoring_pass`

## Spring Configuration
Backend configuration is in:
- `backend/src/main/resources/application.yml`

Flyway migration files are in:
- `backend/src/main/resources/db/migration`
