const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    incident_id: { type: String, unique: true, index: true },
    tenant_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    
    severity: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'],
        index: true 
    },
    status: {
        type: String,
        enum: ['new', 'investigating', 'contained', 'resolved', 'closed'],
        default: 'new',
        index: true
    },
    
    mitre_attack: {
        tactics: [{
            id: { type: String },
            name: { type: String },
            techniques: [{
                id: { type: String },
                name: { type: String }
            }]
        }]
    },
    
    affected_assets: [{ type: String }],
    
    business_impact: {
        financial_impact: { type: Number },
        downtime_minutes: { type: Number },
        affected_customers: { type: Number },
        data_records_compromised: { type: Number }
    },
    
    // علاقات بالأنظمة الخارجية
    external_references: {
        servicenow_case: { type: String },
        jira_ticket: { type: String }
    }

}, { 
    timestamps: true,
    autoIndex: true 
});

// Create indexes
incidentSchema.index({ tenant_id: 1, status: 1, severity: 1 });
incidentSchema.index({ tenant_id: 1, created_at: -1 });
incidentSchema.index({ 'mitre_attack.tactics.id': 1 });

module.exports = mongoose.model('Incident', incidentSchema);
