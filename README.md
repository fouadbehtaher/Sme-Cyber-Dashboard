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

Backend (local prototype, no auth): `backend/package.json` now exists. `npm ci && npm test` runs 5 tests with mocked models and no database, covering `/health` and the incident read routes. `node server.js` starts and answers `/health`; routes that query MongoDB were not run against a real database. Mounted: `/health` and `/api/incidents` (list, stats, active, by severity, by id, create, update status), with no authentication. Not mounted yet, because their files are empty or missing: `/api/auth` (routes/auth.js, models/User.js), `/api/assets`, `/api/vulnerabilities`, `/api/advanced-queries` (needs the missing `middleware/rbac.js`), and `PUT`/`DELETE /api/incidents/:id` (the frontend calls them; the controller never had handlers). The auth and roles policy is not decided, so do not expose this server beyond localhost. Known mismatch, not fixed: `createIncident` sets `status: 'detected'` and does not set the required `tenant_id`, so creating an incident fails the model's validation.

An architecture diagram is not included on purpose: most of the response and playbook layer is not written yet.
