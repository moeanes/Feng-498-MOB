# Backend Step 03 - Get Single Machine by Identifier

## Goal
Add endpoint:
- `GET /api/v1/machines/{machineId}`

## What this teaches
- Path variable usage (`{machineId}`)
- Handling missing records with `404 Not Found`

## Flow
1. Controller reads `machineId` from URL.
2. Service asks repository for that machine.
3. If found, return response object.
4. If not found, throw `ResponseStatusException(404)`.

## Files
- `machine/api/MachineController.java`
- `machine/service/MachineService.java`

## Verified Results
- Existing identifier -> `200 OK`
- Missing identifier -> `404 Not Found`
