// database/models/ExternalIntegration.js
const externalIntegrationSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    integration_id: { type: String, unique: true, index: true }, // INT-SPLUNK-001
    tenant_id: { type: String, required: true, index: true },
    
    // تكامل SIEM
    siem_integrations: [{
        type: { 
            type: String, 
            enum: ['splunk', 'qradar', 'arcsight', 'elastic'],
            index: true 
        },
        base_url: { type: String },
        api_key: { type: String },
        indexes: { type: [String] }, // Splunk indexes
        sourcetypes: { type: [String] } // Splunk sourcetypes
    }],
    
    // تكامل EDR
    edr_integrations: [{
        vendor: { 
            type: String, 
            enum: ['crowdstrike', 'sentinelone', 'carbonblack', 'microsoft_defender'],
            index: true 
        },
        tenant_id: { type: String },
        client_id: { type: String },
        client_secret: { type: String }
    }],
    
    // تكامل الشبكة
    firewall_integrations: [{
        vendor: { 
            type: String, 
            enum: ['paloalto', 'cisco', 'fortinet', 'checkpoint'],
            index: true 
        },
        management_ip: { type: String },
        api_username: { type: String },
        api_password: { type: String }
    }],
    
    // مفاتيح API الخارجية
    api_credentials: [{
        service: { type: String, index: true },
        api_key: { type: String },
        secret_key: { type: String },
        base_url: { type: String },
        rate_limit: { type: Number } // requests per minute
    }]

}, { timestamps: true });
