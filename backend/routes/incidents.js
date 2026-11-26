const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// Fixed-path routes first, so ':id' does not capture them.
router.get('/stats', incidentController.getIncidentStats);
router.get('/status/active', incidentController.getActiveIncidents);
router.get('/severity/:level', incidentController.getIncidentsBySeverity);

router.get('/', incidentController.getAllIncidents);
router.get('/:id', incidentController.getIncidentById);
router.post('/', incidentController.createIncident);
router.put('/:id/status', incidentController.updateIncidentStatus);

// Not mounted: PUT /:id and DELETE /:id. The frontend calls them
// (incidentService.js) but the controller never had handlers, and they are
// destructive without authentication. Decide the auth policy first.

module.exports = router;
