const Incident = require('../models/Incident');
const Asset = require('../models/Asset');
const { sendAlert } = require('../services/notificationService');

exports.getAllIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, status } = req.query;
    
    const filter = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    
    const incidents = await Incident.find(filter)
      .populate('affected_assets')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Incident.countDocuments(filter);
    
    res.json({
      incidents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('affected_assets')
      .populate('response_actions');
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createIncident = async (req, res) => {
  try {
    const incident = new Incident({
      ...req.body,
      detected_by: 'manual',
      status: 'detected'
    });
    
    const newIncident = await incident.save();
    
    // Send real-time alert
    req.app.get('io').emit('new_incident', newIncident);
    
    // Send notifications
    await sendAlert(newIncident);
    
    res.status(201).json(newIncident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateIncidentStatus = async (req, res) => {
  try {
    const { status, response_actions } = req.body;
    
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        response_actions: response_actions || [],
        updated_at: Date.now()
      },
      { new: true }
    ).populate('affected_assets');
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Emit status update
    req.app.get('io').emit('incident_updated', incident);
    
    res.json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getIncidentStats = async (req, res) => {
  try {
    const stats = await Incident.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = await Incident.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const timeline = await Incident.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      severity: stats,
      status: statusStats,
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read-only handlers used by the frontend (frontend/src/services/incidentService.js).
exports.getActiveIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ status: { $nin: ['resolved', 'closed'] } })
      .populate('affected_assets')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIncidentsBySeverity = async (req, res) => {
  try {
    const incidents = await Incident.find({ severity: req.params.level })
      .populate('affected_assets')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
