const express = require('express');
const router = express.Router();
const vulnerabilityController = require('../controllers/vulnerabilityController');

// Scan network for vulnerabilities
router.post('/scan', vulnerabilityController.scanNetwork);

// Get all vulnerabilities
router.get('/', vulnerabilityController.getAllVulnerabilities);

// Get vulnerability by ID
router.get('/:id', vulnerabilityController.getVulnerabilityById);

// Update vulnerability
router.put('/:id', vulnerabilityController.updateVulnerability);

// Delete vulnerability
router.delete('/:id', vulnerabilityController.deleteVulnerability);

module.exports = router;
