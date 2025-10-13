const express = require('express');
const router = express.Router();
const AdvancedQueryService = require('../services/AdvancedQueryService');
const { RBACMiddleware, requirePermission } = require('../middleware/rbac');

// تطبيق التحكم في الصلاحيات على جميع routes
router.use(RBACMiddleware);

/**
 * GET /api/advanced-queries/high-risk-events
 * الحصول على الأحداث عالية الخطورة
 */
router.get('/high-risk-events', requirePermission('read', 'security_events'), async (req, res) => {
    try {
        const { hours = 24, limit = 1000 } = req.query;
        
        const events = await AdvancedQueryService.findHighRiskEvents(
            req.user.tenant_id, 
            parseInt(hours), 
            parseInt(limit)
        );
        
        res.json({
            success: true,
            data: events,
            count: events.length,
            time_range: `${hours} hours`
        });
        
    } catch (error) {
        console.error('High risk events query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch high risk events'
        });
    }
});

/**
 * GET /api/advanced-queries/suspicious-connections
 * تحليل الاتصالات المشبوهة
 */
router.get('/suspicious-connections', requirePermission('read', 'security_events'), async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        
        const analysis = await AdvancedQueryService.analyzeSuspiciousConnections(
            req.user.tenant_id, 
            parseInt(hours)
        );
        
        res.json({
            success: true,
            data: analysis,
            count: analysis.length,
            analysis_timeframe: `${hours} hours`
        });
        
    } catch (error) {
        console.error('Suspicious connections analysis failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze suspicious connections'
        });
    }
});

/**
 * POST /api/advanced-queries/event-search
 * بحث متقدم في الأحداث
 */
router.post('/event-search', requirePermission('read', 'security_events'), async (req, res) => {
    try {
        const filters = req.body;
        
        const events = await AdvancedQueryService.advancedEventSearch(
            req.user.tenant_id, 
            filters
        );
        
        res.json({
            success: true,
            data: events,
            count: events.length,
            filters_applied: filters
        });
        
    } catch (error) {
        console.error('Advanced event search failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to perform advanced event search'
        });
    }
});

/**
 * GET /api/advanced-queries/real-time-stats
 * إحصائيات الوقت الحقيقي
 */
router.get('/real-time-stats', requirePermission('read', 'dashboard'), async (req, res) => {
    try {
        const { time_range = '1h' } = req.query;
        
        const stats = await AdvancedQueryService.getRealTimeEventStats(
            req.user.tenant_id, 
            time_range
        );
        
        res.json({
            success: true,
            data: stats[0], // لأن $facet يرجع array
            time_range: time_range
        });
        
    } catch (error) {
        console.error('Real-time stats query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch real-time statistics'
        });
    }
});

/**
 * POST /api/advanced-queries/bulk-close-incidents
 * إغلاق جماعي للحوادث القديمة (للمشرفين فقط)
 */
router.post('/bulk-close-incidents', requirePermission('update', 'incidents'), async (req, res) => {
    try {
        const { days_old = 7 } = req.body;
        
        const result = await AdvancedQueryService.bulkCloseStaleIncidents(
            req.user.tenant_id, 
            parseInt(days_old)
        );
        
        res.json({
            success: true,
            message: `Closed ${result.modified} stale incidents`,
            data: result
        });
        
    } catch (error) {
        console.error('Bulk close incidents failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to close stale incidents'
        });
    }
});

module.exports = router;
