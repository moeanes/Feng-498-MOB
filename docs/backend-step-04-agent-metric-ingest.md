# Backend Step 04 - Agent Metric Ingestion

## Goal
Add endpoint for agent software to send metrics:
- `POST /api/v1/agent/metrics`

## What this endpoint does
1. Validates request body fields.
2. Checks whether machine exists.
3. Saves a new metric record into `metric_records` table.
4. Updates machine status to `ONLINE` and updates `last_seen`.
5. Returns created metric record identifier and timestamp.

## Files
- `agentapi/api/AgentMetricController.java`
- `agentapi/api/AgentMetricIngestRequest.java`
- `agentapi/api/AgentMetricIngestResponse.java`
- `agentapi/service/AgentMetricService.java`
- `metric/domain/MetricRecord.java`
- `metric/repo/MetricRecordRepository.java`
- `machine/domain/Machine.java` (added online update method)

## Verified behavior
- Existing machine identifier -> `201 Created`
- Missing machine identifier -> `404 Not Found`
- Metric count increases in database
- Machine status changes to `ONLINE`
