# Sme-Cyber-Dashboard
Your Integrated Cyber Shield: Proactive Exposure Management and Automated Incident Response for SMEs

## Current status (read this first)

This repository is an early scaffold, not a working product. Counts below are files in the repository at the time of writing. They describe what is committed, not whether anything has been run.

| Part | Has content | Empty file (0 bytes) |
| --- | --- | --- |
| `airs/core` (incident response engine) | `incident_engine.py` | `detection_engine.py`, `alert_manager.py`, `response_orchestrator.py` |
| `airs/detectors` | `network_detector.py`, `vulnerability_scanner.py` | `endpoint_detector.py`, `log_analyzer.py`, `threat_intel.py` |
| `airs/responders` | none | all 4 responders |
| `airs/playbooks` | none | all 4 playbooks |
| `backend` routes | `incidents.js`, `vulnerabilities.js`, `advancedQueries.js` | `assets.js`, `dashboard.js` |
| `backend` services | `nmapScanner.js`, `notificationService.js`, `AdvancedQueryService.js` | `databaseService.js`, `virusTotalService.js` |
| `frontend/src/components` | 17 files | none |

Backend (local prototype, fails closed): `backend/package.json` exists. `npm ci && npm test` runs 11 jest tests: 6 with mocked models, and 5 against an in-memory MongoDB (mongodb-memory-server downloads a mongod binary on first run) covering tenant scoping in `services/AdvancedQueryService.js` and model validation. `node server.js` starts and answers `/health`, which reports nothing about the database. Every `/api/*` endpoint currently returns 503 ("authentication and tenant policy are not configured"), reads and writes alike, because the auth/tenant policy is not decided: there is no User model, no auth routes and no RBAC middleware, and incidents require a `tenant_id`. The incident routes in `routes/incidents.js` are implemented but disabled; the tests mount that router on a throwaway app with mocked models, so they show the handler logic only, not working database CRUD (nothing was run against a real MongoDB). Not implemented: `/api/auth`, `/api/assets`, `/api/vulnerabilities`, `/api/advanced-queries` (needs the missing `middleware/rbac.js`), and incident update/delete by id. Auth/tenant design found in the repo (not a decided policy): every model carries a required `tenant_id`; `database/models/Role.js` holds a Role schema (data scope, response/investigation permissions, time constraints) and, in the same file, a User schema with expiring role assignments; the frontend sends a Bearer token plus an `X-Tenant-ID` header; `routes/advancedQueries.js` expects a missing `middleware/rbac.js` to set `req.user.tenant_id` and to provide `requirePermission(action, resource)`. Still undefined: how tokens are issued (login, password storage, signing key), who may register, and how a Role maps to read/update on incidents, events and the dashboard. Known mismatch, not fixed: `createIncident` sets `status: 'detected'` (not in the model enum) and omits the required `tenant_id`. Nothing is deployed.

An architecture diagram is not included on purpose: most of the response and playbook layer is not written yet.
