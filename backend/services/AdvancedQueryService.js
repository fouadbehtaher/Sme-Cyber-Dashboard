const SecurityEvent = require('../models/SecurityEvent');
const Incident = require('../models/Incident');

class AdvancedQueryService {
    
    /**
     * البحث عن أحداث عالية الخطورة في آخر 24 ساعة
     */
    async findHighRiskEvents(tenantId, hours = 24, limit = 1000) {
        const timeThreshold = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        return await SecurityEvent.find({
            tenant_id: tenantId,
            timestamp: { $gte: timeThreshold },
            severity: { $in: ['high', 'critical'] },
            'behavioral_analysis.anomaly_score': { $gt: 80 }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
    }
    
    /**
     * تحليل الاتصالات المشبوهة
     */
    async analyzeSuspiciousConnections(tenantId, hours = 24) {
        const timeThreshold = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        return await SecurityEvent.aggregate([
            {
                $match: {
                    tenant_id: tenantId,
                    timestamp: { $gte: timeThreshold }
                }
            },
            {
                $group: {
                    _id: '$network_context.src_ip',
                    total_events: { $sum: 1 },
                    unique_dest_ports: { $addToSet: '$network_context.dest_port' },
                    high_severity_count: {
                        $sum: {
                            $cond: [
                                { $in: ['$severity', ['high', 'critical']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $match: {
                    high_severity_count: { $gt: 10 },
                    $expr: { $gt: [{ $size: '$unique_dest_ports' }, 50] }
                }
            },
            {
                $project: {
                    src_ip: '$_id',
                    total_events: 1,
                    unique_port_count: { $size: '$unique_dest_ports' },
                    high_severity_count: 1,
                    risk_score: {
                        $add: [
                            { $multiply: ['$high_severity_count', 5] },
                            { $multiply: [{ $size: '$unique_dest_ports' }, 2] }
                        ]
                    }
                }
            },
            { $sort: { risk_score: -1 } }
        ]);
    }
    
    /**
     * تحديث الحوادث الجماعي - إغلاق الحوادث القديمة
     */
    async bulkCloseStaleIncidents(tenantId, daysOld = 7) {
        const timeThreshold = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
        
        const result = await Incident.updateMany(
            {
                tenant_id: tenantId,
                status: 'new',
                created_at: { $lt: timeThreshold }
            },
            {
                $set: {
                    status: 'auto_closed',
                    closure_reason: 'stale_incident',
                    updated_at: new Date()
                }
            }
        );
        
        return {
            matched: result.matchedCount,
            modified: result.modifiedCount
        };
    }
    
    /**
     * البحث المتقدم بالأحداث مع تصفية معقدة
     */
    async advancedEventSearch(tenantId, filters = {}) {
        const {
            startTime,
            endTime,
            severity,
            sourceIps,
            destIps,
            protocols,
            minAnomalyScore
        } = filters;
        
        const query = { tenant_id: tenantId };
        
        // بناء query ديناميكي
        if (startTime || endTime) {
            query.timestamp = {};
            if (startTime) query.timestamp.$gte = new Date(startTime);
            if (endTime) query.timestamp.$lte = new Date(endTime);
        }
        
        if (severity && severity.length > 0) {
            query.severity = { $in: severity };
        }
        
        if (sourceIps && sourceIps.length > 0) {
            query['network_context.src_ip'] = { $in: sourceIps };
        }
        
        if (destIps && destIps.length > 0) {
            query['network_context.dest_ip'] = { $in: destIps };
        }
        
        if (protocols && protocols.length > 0) {
            query['network_context.protocol'] = { $in: protocols };
        }
        
        if (minAnomalyScore) {
            query['behavioral_analysis.anomaly_score'] = { $gte: minAnomalyScore };
        }
        
        return await SecurityEvent.find(query)
            .sort({ timestamp: -1 })
            .limit(1000)
            .lean();
    }
    
    /**
     * إحصائيات الأحداث في وقت حقيقي
     */
    async getRealTimeEventStats(tenantId, timeRange = '1h') {
        const timeRanges = {
            '1h': 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };
        
        const timeThreshold = new Date(Date.now() - (timeRanges[timeRange] || timeRanges['1h']));
        
        return await SecurityEvent.aggregate([
            {
                $match: {
                    tenant_id: tenantId,
                    timestamp: { $gte: timeThreshold }
                }
            },
            {
                $facet: {
                    total_events: [{ $count: 'count' }],
                    by_severity: [
                        { $group: { _id: '$severity', count: { $sum: 1 } } }
                    ],
                    by_source: [
                        { $group: { _id: '$data_source.type', count: { $sum: 1 } } }
                    ],
                    top_source_ips: [
                        { 
                            $group: { 
                                _id: '$network_context.src_ip', 
                                count: { $sum: 1 },
                                last_seen: { $max: '$timestamp' }
                            } 
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    high_risk_events: [
                        { 
                            $match: { 
                                severity: { $in: ['high', 'critical'] },
                                'behavioral_analysis.anomaly_score': { $gt: 70 }
                            } 
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ]);
    }
}

module.exports = new AdvancedQueryService();
