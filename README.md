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

Known gap: `backend/app.js` requires `./routes/auth`, which is not in the repository, so the backend does not start as committed.

An architecture diagram is not included on purpose: most of the response and playbook layer is not written yet.
