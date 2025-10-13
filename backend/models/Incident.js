const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
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
    required: true
  },
  affected_assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  source_ip: String,
  destination_ip: String,
  detected_by: String, // Which detector found it
  response_actions: [String],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field on save
incidentSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Incident', incidentSchema);
