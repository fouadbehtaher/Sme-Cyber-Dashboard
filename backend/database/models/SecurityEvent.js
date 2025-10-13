// database/models/SecurityEvent.js
const securityEventSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // المفاتيح الأساسية
    event_id: { type: String, unique: true, index: true }, // EVT-2024-001-ABC123
    source_event_id: { type: String, index: true }, // المعرف من المصدر الأصلي
    tenant_id: { type: String, required: true, index: true },
    
    // مصدر البيانات المتقدم
    data_source: {
        type: { 
            type: String, 
            enum: ['firewall', 'ids', 'ips', 'edr', 'siem', 'cloud_trail', 'audit_log'],
            index: true 
        },
        vendor: { type: String, index: true }, // cisco, paloalto, crowdstrike
        product: { type: String, index: true },
        version: { type: String }
    },
    
    // معلومات الشبكة المتقدمة
    network_context: {
        src_ip: { type: String, index: true },
        dest_ip: { type: String, index: true },
        src_port: { type: Number },
        dest_port: { type: Number },
        protocol: { type: String, index: true },
        bytes_sent: { type: Number },
        bytes_received: { type: Number },
        packets: { type: Number },
        tcp_flags: { type: String },
        geoip: {
            src_country: { type: String, index: true },
            dest_country: { type: String, index: true },
            src_asn: { type: String },
            dest_asn: { type: String }
        }
    },
    
    // تحليل السلوك
    behavioral_analysis: {
        anomaly_score: { type: Number, index: true },
        baseline_deviation: { type: Number },
        peer_group_comparison: { type: Number }
    },
    
    // الثغرات الأمنية
    vulnerability_context: {
        cve_id: { type: String, index: true },
        cvss_score: { type: Number, index: true },
        exploited: { type: Boolean, default: false, index: true }
    },
    
    // فهرس مركب للأداء
    composite_index: { type: String, index: true } // tenant_id:timestamp:severity

}, { 
    timestamps: true,
    autoIndex: true 
});

// Partitioning افتراضي للحوادث
securityEventSchema.index({ tenant_id: 1, timestamp: -1, severity: -1 });
securityEventSchema.index({ 'network_context.src_ip': 1, timestamp: -1 });
securityEventSchema.index({ 'network_context.dest_ip': 1, timestamp: -1 });
securityEventSchema.index({ 'data_source.type': 1, timestamp: -1 });
securityEventSchema.index({ 'behavioral_analysis.anomaly_score': -1 });
