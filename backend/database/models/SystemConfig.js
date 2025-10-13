// database/models/SystemConfig.js
const systemConfigSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    config_id: { type: String, unique: true, index: true }, // CONFIG-CORRELATION-001
    tenant_id: { type: String, required: true, index: true },
    
    // إعدادات محرك الارتباط
    correlation_engine: {
        rules: [{
            rule_id: { type: String, index: true },
            name: { type: String },
            enabled: { type: Boolean, default: true },
            conditions: { type: mongoose.Schema.Types.Mixed },
            actions: { type: mongoose.Schema.Types.Mixed }
        }],
        time_windows: {
            short_term: { type: Number, default: 300 }, // 5 minutes
            medium_term: { type: Number, default: 3600 }, // 1 hour
            long_term: { type: Number, default: 86400 } // 24 hours
        }
    },
    
    // إعدادات التنبيهات
    alerting: {
        thresholds: {
            high_severity: { type: Number, default: 80 },
            medium_severity: { type: Number, default: 60 },
            low_severity: { type: Number, default: 40 }
        },
        notification_channels: [{
            type: { 
                type: String, 
                enum: ['email', 'slack', 'teams', 'webhook', 'sms'],
                index: true 
            },
            config: { type: mongoose.Schema.Types.Mixed }
        }]
    },
    
    // إعدادات الاحتفاظ البيانات
    data_retention: {
        raw_events: { type: Number, default: 30 }, // days
        normalized_events: { type: Number, default: 90 }, // days
        incidents: { type: Number, default: 365 }, // days
        assets: { type: Number, default: 730 } // days
    }

}, { timestamps: true });
