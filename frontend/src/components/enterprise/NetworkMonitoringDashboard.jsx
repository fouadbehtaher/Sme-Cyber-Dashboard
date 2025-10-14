import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  Button, Chip, LinearProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem,
  IconButton, Tooltip
} from '@mui/material';
import {
  PlayArrow, Pause, Refresh, Visibility,
  VisibilityOff, NetworkCheck, Speed,
  Security, DeviceHub
} from '@mui/icons-material';

const NetworkMonitoringDashboard = () => {
  const [networkData, setNetworkData] = useState({
    traffic: {},
    threats: [],
    devices: [],
    bandwidth: {}
  });
  
  const [activeView, setActiveView] = useState('topology');
  const [showTraffic, setShowTraffic] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleShowTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  useEffect(() => {
    // محاكاة بيانات الشبكة
    const mockNetworkData = {
      traffic: {
        total: 15420,
        suspicious: 342,
        blocked: 125,
        inbound: 8920,
        outbound: 6500
      },
      threats: [
        { id: 1, type: 'DDoS', source: '45.33.32.156', target: '192.168.1.10', severity: 'high', status: 'blocked' },
        { id: 2, type: 'Port Scan', source: '103.21.244.0', target: '192.168.1.20', severity: 'medium', status: 'detected' },
        { id: 3, type: 'Malware', source: '185.199.108.154', target: '192.168.1.15', severity: 'critical', status: 'contained' }
      ],
      devices: [
        { id: 1, name: 'Web-Server-01', ip: '192.168.1.10', type: 'server', status: 'online', traffic: 2450 },
        { id: 2, name: 'DB-Server-01', ip: '192.168.1.11', type: 'server', status: 'online', traffic: 1890 },
        { id: 3, name: 'Firewall-01', ip: '192.168.1.1', type: 'firewall', status: 'online', traffic: 15420 },
        { id: 4, name: 'User-PC-25', ip: '192.168.1.25', type: 'workstation', status: 'online', traffic: 340 }
      ],
      bandwidth: {
        used: 65,
        available: 35,
        peak: 82
      }
    };

    setNetworkData(mockNetworkData);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        📊 مراقبة الشبكة
      </Typography>

      {/* أزرار التحكم */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant={activeView === 'topology' ? 'contained' : 'outlined'}
            startIcon={<DeviceHub />}
            onClick={() => handleViewChange('topology')}
          >
            عرض التوبولوجيا
          </Button>
          <Button
            variant={activeView === 'traffic' ? 'contained' : 'outlined'}
            startIcon={<Speed />}
            onClick={() => handleViewChange('traffic')}
          >
            تحليل الحركة
          </Button>
          <Button
            variant={showTraffic ? 'contained' : 'outlined'}
            startIcon={showTraffic ? <VisibilityOff /> : <Visibility />}
            onClick={handleShowTraffic}
          >
            {showTraffic ? 'إخفاء الحركة' : 'عرض الحركة'}
          </Button>
          <Button
            variant={autoRefresh ? 'contained' : 'outlined'}
            startIcon={autoRefresh ? <Pause /> : <PlayArrow />}
            onClick={handleAutoRefresh}
          >
            {autoRefresh ? 'إيقاف التحديث' : 'تشغيل التحديث'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
          >
            تحديث الآن
          </Button>
        </Box>
      </Paper>

      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  إجمالي الحركة
                </Typography>
              </Box>
              <Typography variant="h4">
                {networkData.traffic.total?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                حزمة/ثانية
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  حركة مشبوهة
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {networkData.traffic.suspicious}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                حزمة/ثانية
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NetworkCheck color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  النطاق الترددي
                </Typography>
              </Box>
              <Typography variant="h4">
                {networkData.bandwidth.used}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={networkData.bandwidth.used} 
                    color={networkData.bandwidth.used > 80 ? 'error' : 'primary'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeviceHub color="info" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  الأجهزة النشطة
                </Typography>
              </Box>
              <Typography variant="h4">
                {networkData.devices.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                جهاز
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* توزيع الحركة */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 توزيع حركة الشبكة
            </Typography>
            <NetworkTrafficChart showTraffic={showTraffic} />
          </Paper>
        </Grid>

        {/* التهديدات النشطة */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, maxHeight: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              🚨 التهديدات النشطة
            </Typography>
            <ActiveThreatsList threats={networkData.threats} />
          </Paper>
        </Grid>

        {/* قائمة الأجهزة */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              💻 الأجهزة المتصلة بالشبكة
            </Typography>
            <NetworkDevicesTable devices={networkData.devices} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// مكون مخطط حركة الشبكة
const NetworkTrafficChart = ({ showTraffic }) => {
  return (
    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body1" color="textSecondary">
        {showTraffic ? '📊 عرض مخطط حركة الشبكة الحي' : '👁️ إضغط على "عرض الحركة" لرؤية تحليل حركة الشبكة'}
      </Typography>
    </Box>
  );
};

// قائمة التهديدات النشطة
const ActiveThreatsList = ({ threats }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[severity];
  };

  const getStatusColor = (status) => {
    const colors = {
      blocked: 'success',
      detected: 'warning',
      contained: 'info',
      active: 'error'
    };
    return colors[status];
  };

  return (
    <Box>
      {threats.map((threat) => (
        <Card key={threat.id} sx={{ mb: 2, borderLeft: 4, borderColor: getSeverityColor(threat.severity) + '.main' }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" gutterBottom>
              {threat.type}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                من: {threat.source}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                إلى: {threat.target}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={threat.severity} 
                size="small" 
                color={getSeverityColor(threat.severity)}
              />
              <Chip 
                label={threat.status} 
                size="small" 
                color={getStatusColor(threat.status)}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// جدول الأجهزة
const NetworkDevicesTable = ({ devices }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>اسم الجهاز</TableCell>
            <TableCell>عنوان IP</TableCell>
            <TableCell>النوع</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>حركة المرور</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DeviceHub sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    {device.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={device.ip} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={device.type} 
                  size="small" 
                  color="primary"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={device.status} 
                  size="small" 
                  color={device.status === 'online' ? 'success' : 'error'}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(device.traffic / 2000) * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {device.traffic}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Tooltip title="عرض التفاصيل">
                  <IconButton size="small" color="primary">
                    <Visibility />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NetworkMonitoringDashboard;
