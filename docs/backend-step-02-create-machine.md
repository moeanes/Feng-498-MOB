# Backend Step 02 - Create Machine Flow

## Goal
Implement machine creation endpoint:
- `POST /api/v1/machines`

## Request Flow
1. JSON request reaches controller.
2. Controller validates request body (`@Valid`).
3. Controller calls service.
4. Service creates domain entity and saves it via repository.
5. Service maps saved entity to response DTO.
6. Controller returns `201 Created` with created machine data.

## Files
- `machine/api/CreateMachineRequest.java` -> request validation rules.
- `machine/api/MachineController.java` -> `@PostMapping` endpoint.
- `machine/service/MachineService.java` -> create business logic.
- `machine/domain/Machine.java` -> entity factory `Machine.create(...)`.

## Why this matters
This is your first **write operation** and shows complete backend layering:
API -> Service -> Repository -> Database.

## Example Request
```bash
curl -X POST http://localhost:8080/api/v1/machines \
  -H 'Content-Type: application/json' \
  -d '{"name":"Lab-PC-02","hostname":"lab-pc-02","ipAddress":"192.168.1.102","osName":"Ubuntu 24.04","agentVersion":"0.1.0"}'
```
