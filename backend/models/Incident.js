const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'contained', 'resolved'],
    default: 'detected'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'malware', 
      'phishing', 
      'ddos', 
      'data_breach',
      'unauthorized_access',
      'vulnerability_exploit'
    ]
  },
  affected_assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  source_ip: String,
  destination_ip: String,
  detected_by: {
    type: String,
    required: true
  },
  response_actions: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  }],
  evidence: [{
    type: String // URLs to evidence files
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
incidentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
