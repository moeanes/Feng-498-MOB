# Architecture Notes

Initial architecture agreed:
- Agent(s) -> Backend REST API -> PostgreSQL
- Backend -> WebSocket -> React dashboard
- JWT for dashboard users, machine token for agents
