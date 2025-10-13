const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// Get all incidents
router.get('/', incidentController.getAllIncidents);

// Get incident by ID
router.get('/:id', incidentController.getIncidentById);

// Create a new incident
router.post('/', incidentController.createIncident);

// Update an incident
router.put('/:id', incidentController.updateIncident);

// Delete an incident
router.delete('/:id', incidentController.deleteIncident);

// Get active incidents (status not resolved)
router.get('/status/active', incidentController.getActiveIncidents);

// Get incidents by severity
router.get('/severity/:level', incidentController.getIncidentsBySeverity);

module.exports = router;
