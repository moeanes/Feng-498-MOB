# Backend Step 05 - Metric Read APIs

## Goal
Add read endpoints for dashboard metric visualization:
- `GET /api/v1/machines/{machineId}/latest`
- `GET /api/v1/machines/{machineId}/metrics?from=<ISO>&to=<ISO>`

## What this step adds
1. Latest metric lookup per machine.
2. Historical metric range lookup per machine.
3. Input validation for invalid time ranges (`from > to` -> `400`).
4. Not found behavior:
   - Unknown machine -> `404`
   - No latest metric for machine -> `404`

## Main files
- `machine/api/MachineController.java`
- `machine/service/MachineService.java`
- `machine/api/MachineMetricResponse.java`
- `metric/repo/MetricRecordRepository.java`
- `metric/domain/MetricRecord.java`

## Verified responses
- Latest endpoint -> `200 OK` with one metric object
- History endpoint -> `200 OK` with metric list
- Bad range request -> `400 Bad Request`
