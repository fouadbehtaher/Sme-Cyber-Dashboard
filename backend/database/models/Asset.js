// database/models/Asset.js - هيكل الأصول المتقدم
const assetSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    // المفاتيح الأساسية للأصول
    asset_id: { type: String, unique: true, index: true }, // AST-2024-001-XYZ
    tenant_id: { type: String, required: true, index: true }, // TNT-CORP-001
    organization_id: { type: String, required: true, index: true },
    
    // معلومات تعريفية متقدمة
    criticality_level: { 
        type: String, 
        enum: ['mission_critical', 'business_critical', 'high', 'medium', 'low'],
        index: true 
    },
    asset_type: {
        type: String,
        enum: ['web_server', 'database_server', 'network_device', 'workstation', 'mobile_device', 'iot_device', 'cloud_instance'],
        index: true
    },
    
    // معلومات الشبكة المتقدمة
    network_segment: { type: String, index: true },
    vlan_id: { type: String, index: true },
    security_zone: { 
        type: String, 
        enum: ['dmz', 'internal', 'restricted', 'management'],
        index: true 
    },
    
    // التصنيف الأمني
    data_classification: {
        type: String,
        enum: ['confidential', 'restricted', 'internal', 'public'],
        index: true
    },
    
    // العلاقات المعقدة
    dependencies: [{
        asset_id: { type: String, ref: 'Asset' },
        dependency_type: { type: String, enum: ['network', 'application', 'data'] },
        criticality: { type: String, enum: ['high', 'medium', 'low'] }
    }],
    
    // التواجد في الأنظمة الأخرى
    cmdb_reference: { type: String, index: true },
    service_now_sys_id: { type: String, index: true },
    splunk_reference: { type: String, index: true },
    
    // indexes مركبة للأداء
}, { 
    timestamps: true,
    autoIndex: true 
});

// إنشاء indexes متقدمة
assetSchema.index({ tenant_id: 1, criticality_level: 1, security_zone: 1 });
assetSchema.index({ tenant_id: 1, network_segment: 1, asset_type: 1 });
assetSchema.index({ tenant_id: 1, last_seen: -1 });
assetSchema.index({ 'ip_addresses.ipv4': 1 }, { sparse: true });
assetSchema.index({ 'ip_addresses.ipv6': 1 }, { sparse: true });

// Text search للأصول
assetSchema.index({
    'hostname': 'text',
    'fqdn': 'text',
    'os.name': 'text',
    'tags': 'text'
});
