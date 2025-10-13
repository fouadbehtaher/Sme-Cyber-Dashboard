// database/models/Incident.js
const incidentSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // المفاتيح الأساسية للحوادث
    incident_id: { type: String, unique: true, index: true }, // INC-2024-001-5A2B3C
    correlation_id: { type: String, index: true }, // للربط بين الحوادث
    tenant_id: { type: String, required: true, index: true },
    
    // تصنيف الحادث المتقدم
    mitre_attack: {
        tactics: [{
            id: { type: String }, // TA0001, TA0002
            name: { type: String },
            techniques: [{
                id: { type: String }, // T1055, T1068
                name: { type: String },
                subtechniques: [{
                    id: { type: String }, // T1055.001
                    name: { type: String }
                }]
            }]
        }]
    },
    
    // سلسلة الهجوم
    kill_chain_phase: {
        type: String,
        enum: ['reconnaissance', 'weaponization', 'delivery', 'exploitation', 'installation', 'command_control', 'actions_objectives'],
        index: true
    },
    
    // تأثير الأعمال
    business_impact: {
        financial_impact: { type: Number }, // بالدولار
        downtime_minutes: { type: Number },
        affected_customers: { type: Number },
        data_records_compromised: { type: Number }
    },
    
    // العلاقات المعقدة
    related_incidents: [{
        incident_id: { type: String, ref: 'Incident' },
        relationship_type: { type: String, enum: ['campaign', 'prerequisite', 'escalation'] }
    }],
    
    // التكامل مع الأنظمة الخارجية
    external_references: {
        servicenow_case: { type: String },
        jira_ticket: { type: String },
        splunk_correlation: { type: String },
        qradar_offense: { type: String }
    },
    
    // إدارة الحادث
    sla_breached: { type: Boolean, default: false, index: true },
    escalation_level: { 
        type: String, 
        enum: ['level1', 'level2', 'level3', 'ciso', 'executive'],
        index: true 
    }

}, { 
    timestamps: true,
    autoIndex: true 
});

// indexes مركبة متقدمة
incidentSchema.index({ tenant_id: 1, status: 1, severity: 1 });
incidentSchema.index({ tenant_id: 1, created_at: -1, severity: -1 });
incidentSchema.index({ 'mitre_attack.tactics.id': 1 });
incidentSchema.index({ 'mitre_attack.techniques.id': 1 });
incidentSchema.index({ correlation_id: 1, tenant_id: 1 });
