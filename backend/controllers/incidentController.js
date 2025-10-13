const Incident = require('../models/Incident');

// Get all incidents
exports.getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().populate('affected_assets').sort({ created_at: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get incident by ID
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate('affected_assets');
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new incident
exports.createIncident = async (req, res) => {
  const incident = new Incident({
    title: req.body.title,
    description: req.body.description,
    severity: req.body.severity,
    type: req.body.type,
    affected_assets: req.body.affected_assets,
    source_ip: req.body.source_ip,
    destination_ip: req.body.destination_ip,
    detected_by: req.body.detected_by
  });

  try {
    const newIncident = await incident.save();
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an incident
exports.updateIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Update fields
    if (req.body.title != null) incident.title = req.body.title;
    if (req.body.description != null) incident.description = req.body.description;
    if (req.body.severity != null) incident.severity = req.body.severity;
    if (req.body.status != null) incident.status = req.body.status;
    if (req.body.type != null) incident.type = req.body.type;
    if (req.body.affected_assets != null) incident.affected_assets = req.body.affected_assets;
    if (req.body.source_ip != null) incident.source_ip = req.body.source_ip;
    if (req.body.destination_ip != null) incident.destination_ip = req.body.destination_ip;
    if (req.body.detected_by != null) incident.detected_by = req.body.detected_by;
    if (req.body.response_actions != null) incident.response_actions = req.body.response_actions;

    const updatedIncident = await incident.save();
    res.json(updatedIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an incident
exports.deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    await Incident.deleteOne({ _id: req.params.id });
    res.json({ message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active incidents
exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      status: { $ne: 'resolved' }
    }).populate('affected_assets').sort({ created_at: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get incidents by severity
exports.getIncidentsBySeverity = async (req, res) => {
  try {
    const incidents = await Incident.find({
      severity: req.params.level
    }).populate('affected_assets').sort({ created_at: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
