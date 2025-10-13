const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    event_id: { type: String, unique: true, index: true },
    tenant_id: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    
    data_source: {
        type: { type: String, enum: ['firewall', 'ids', 'ips', 'edr'], index: true },
        vendor: { type: String, index: true },
        product: { type: String },
        version: { type: String }
    },
    
    network_context: {
        src_ip: { type: String, index: true },
        dest_ip: { type: String, index: true },
        src_port: { type: Number },
        dest_port: { type: Number },
        protocol: { type: String, index: true },
        bytes_sent: { type: Number },
        bytes_received: { type: Number },
        geoip: {
            src_country: { type: String, index: true },
            dest_country: { type: String, index: true },
            src_asn: { type: String },
            dest_asn: { type: String }
        }
    },
    
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], index: true },
    threat_indicators: [{ type: String }],
    
    // تحليل السلوك
    behavioral_analysis: {
        anomaly_score: { type: Number, index: true },
        baseline_deviation: { type: Number }
    }

}, { 
    timestamps: true,
    autoIndex: true 
});

// Create indexes for performance
securityEventSchema.index({ tenant_id: 1, timestamp: -1 });
securityEventSchema.index({ 'network_context.src_ip': 1, timestamp: -1 });
securityEventSchema.index({ severity: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
