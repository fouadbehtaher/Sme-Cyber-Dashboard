// database/models/Role.js
const roleSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    role_id: { type: String, unique: true, index: true }, // ROLE-SOC-ANALYST-001
    tenant_id: { type: String, required: true, index: true },
    
    // الصلاحيات المتقدمة
    permissions: {
        data_access: {
            scope: { 
                type: String, 
                enum: ['global', 'departmental', 'regional', 'personal'],
                index: true 
            },
            segments: [{ type: String }], // network_segments محددة
            classifications: [{ type: String }] // data_classifications مسموحة
        },
        actions: {
            investigation: {
                view_sensitive_data: { type: Boolean, default: false },
                export_data: { type: Boolean, default: false },
                access_raw_logs: { type: Boolean, default: false }
            },
            response: {
                manual_containment: { type: Boolean, default: false },
                execute_playbooks: { type: Boolean, default: false },
                escalate_incidents: { type: Boolean, default: false }
            }
        }
    },
    
    // القيود الزمنية
    temporal_constraints: {
        allowed_hours: {
            start: { type: String }, // "08:00"
            end: { type: String }    // "18:00"
        },
        days_of_week: [{ type: Number }] // [1,2,3,4,5] لأيام العمل
    }

}, { timestamps: true });

// database/models/User.js
const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user_id: { type: String, unique: true, index: true }, // USER-JSMITH-001
    tenant_id: { type: String, required: true, index: true },
    
    // المعلومات الوظيفية
    organizational_context: {
        department: { type: String, index: true },
        team: { type: String, index: true },
        location: { type: String, index: true },
        manager_id: { type: String, ref: 'User' }
    },
    
    // تعدد الأدوار
    roles: [{
        role_id: { type: String, ref: 'Role' },
        assigned_at: { type: Date, default: Date.now },
        assigned_by: { type: String, ref: 'User' },
        expires_at: { type: Date }
    }],
    
    // مفاتيح الجلسات المتقدمة
    active_sessions: [{
        session_id: { type: String, unique: true },
        ip_address: { type: String },
        user_agent: { type: String },
        location: { type: String },
        last_activity: { type: Date },
        expires_at: { type: Date }
    }]

}, { timestamps: true });
