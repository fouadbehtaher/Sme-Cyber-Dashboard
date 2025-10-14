// Enterprise SOC Dashboard
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Card, CardContent,
  AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Badge, Chip, Avatar,
  Tabs, Tab, LinearProgress, Tooltip, Divider,
  useTheme, useMediaQuery, Dialog, Button,
  TextField, Select, MenuItem, InputLabel, FormControl, Checkbox, FormControlLabel, FormGroup
} from '@mui/material';
import {
  Dashboard, Security, Warning, Analytics,
  Notifications, Settings, People, Storage,
  Cloud, NetworkCheck, DeviceHub, BarChart,
  Lock, PlayArrow, Refresh, Add,
  Menu as MenuIcon, AccountCircle, Business
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import enterpriseApi from '../../services/enterpriseApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const socTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2'
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055'
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c'
    }
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    }
  }
});

const navigationItems = [
  { text: 'نظرة عامة', icon: <Dashboard />, tab: 0 },
  { text: 'لوحة التهديدات', icon: <Security />, tab: 1 },
  { text: 'إدارة الحوادث', icon: <Warning />, tab: 2 },
  { text: 'مراقبة الأصول', icon: <DeviceHub />, tab: 3 },
  { text: 'تحليل الشبكة', icon: <NetworkCheck />, tab: 4 },
  { text: 'التقارير والتحليلات', icon: <Analytics />, tab: 5 },
  { text: 'إدارة النظام', icon: <Settings />, tab: 6 }
];

const EnterpriseSOCDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [trafficDialogOpen, setTrafficDialogOpen] = useState(false);
  const [dialogMsg, setDialogMsg] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [incidentForm, setIncidentForm] = useState({ title: '', description: '', severity: 'medium', date: '', attachment: null });
  const [scanForm, setScanForm] = useState({ type: 'full', asset: '', range: '' });
  const [refreshTypes, setRefreshTypes] = useState({ assets: true, threats: false, incidents: false, system: false });
  const [reportForm, setReportForm] = useState({ type: 'summary', from: '', to: '', filter: '' });
  const [trafficData, setTrafficData] = useState([]);
  const [trafficChartData, setTrafficChartData] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // فتح نافذة حوار عند الضغط على زر إجراء سريع
  const handleQuickAction = async (label) => {
    if (label === 'حادث جديد') {
      setIncidentDialogOpen(true);
      return;
    }
    if (label === 'بدء المسح') {
      setScanDialogOpen(true);
      return;
    }
    if (label === 'تحديث البيانات') {
      setRefreshDialogOpen(true);
      return;
    }
    if (label === 'تقرير فوري') {
      setReportDialogOpen(true);
      return;
    }
    try {
      let result = '';
      if (label === 'بدء المسح') {
        // يمكن إضافة نافذة اختيار نوع المسح لاحقاً
        result = await enterpriseApi.startScan('full');
        setDialogMsg('تم بدء المسح بنجاح!');
      } else if (label === 'تحديث البيانات') {
        result = await enterpriseApi.refreshData();
        setDialogMsg('تم تحديث البيانات بنجاح!');
      } else if (label === 'حادث جديد') {
        // يمكن إضافة نافذة إدخال تفاصيل لاحقاً
        result = await enterpriseApi.createIncident({ title: 'حادث جديد', description: 'تم الإنشاء من الداش بورد' });
        setDialogMsg('تم تسجيل حادث جديد!');
      } else if (label === 'تقرير فوري') {
        result = await enterpriseApi.getInstantReport();
        setDialogMsg('تم جلب التقرير الفوري بنجاح!');
      } else {
        setDialogMsg(`تم تنفيذ الإجراء: ${label}`);
      }
      setDialogOpen(true);
    } catch (err) {
      setDialogMsg('حدث خطأ أثناء تنفيذ الإجراء');
      setDialogOpen(true);
    }
  };

  // فتح نافذة الإشعارات
  const handleNotifClick = () => {
    setNotifOpen(true);
  };

  // جلب الإشعارات من backend عند فتح النافذة
  useEffect(() => {
    if (notifOpen) {
      enterpriseApi.getThreatIntelligence().then(data => {
        setNotifications(data.notifications || []);
      }).catch(() => {
        setNotifications([]);
      });
    }
  }, [notifOpen]);

  const handleIncidentFormChange = (e) => {
    const { name, value, files } = e.target;
    setIncidentForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleScanFormChange = (e) => {
    const { name, value } = e.target;
    setScanForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncidentSubmit = async () => {
    try {
      // يمكن إرسال المرفق مع البيانات إذا كان backend يدعم ذلك
      const data = { ...incidentForm };
      await enterpriseApi.createIncident(data);
      setDialogMsg('تم تسجيل حادث جديد بنجاح!');
      setDialogOpen(true);
      setIncidentDialogOpen(false);
      setIncidentForm({ title: '', description: '', severity: 'medium', date: '', attachment: null });
    } catch {
      setDialogMsg('حدث خطأ أثناء تسجيل الحادث');
      setDialogOpen(true);
    }
  };

  const handleScanSubmit = async () => {
    try {
      await enterpriseApi.startScan(scanForm.type, scanForm.asset, scanForm.range);
      setDialogMsg('تم بدء المسح بنجاح!');
      setDialogOpen(true);
      setScanDialogOpen(false);
      setScanForm({ type: 'full', asset: '', range: '' });
    } catch {
      setDialogMsg('حدث خطأ أثناء بدء المسح');
      setDialogOpen(true);
    }
  };

  const handleReportSubmit = async () => {
    try {
      await enterpriseApi.getInstantReport(reportForm);
      setDialogMsg('تم جلب التقرير الفوري بنجاح!');
      setDialogOpen(true);
      setReportDialogOpen(false);
      setReportForm({ type: 'summary', from: '', to: '', filter: '' });
    } catch {
      setDialogMsg('حدث خطأ أثناء جلب التقرير');
      setDialogOpen(true);
    }
  };

  const handleRefreshTypeChange = (e) => {
    const { name, checked } = e.target;
    setRefreshTypes((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRefreshSubmit = async () => {
    try {
      // إرسال الأنواع المختارة للـ backend
      await enterpriseApi.refreshData(refreshTypes);
      setDialogMsg('تم تحديث البيانات بنجاح!');
      setDialogOpen(true);
      setRefreshDialogOpen(false);
      setRefreshTypes({ assets: true, threats: false, incidents: false, system: false });
    } catch {
      setDialogMsg('حدث خطأ أثناء تحديث البيانات');
      setDialogOpen(true);
    }
  };

  const handleShowTraffic = async () => {
    setTrafficDialogOpen(true);
    setTrafficLoading(true);
    try {
      const data = await enterpriseApi.getNetworkTraffic();
      setTrafficData(data || []);
      // تجهيز بيانات الرسم البياني
      if (data && data.length > 0) {
        setTrafficChartData({
          labels: data.map(row => row.time),
          datasets: [
            {
              label: 'حجم حركة المرور (MB)',
              data: data.map(row => row.size),
              borderColor: '#2196f3',
              backgroundColor: 'rgba(33,150,243,0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        });
      } else {
        setTrafficChartData(null);
      }
    } catch {
      setTrafficData([]);
      setTrafficChartData(null);
    }
    setTrafficLoading(false);
  };

  return (
    <ThemeProvider theme={socTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a1929' }}>
        {/* شريط التنقل العلوي */}
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: 'linear-gradient(135deg, #0a1929 0%, #132f4c 100%)' }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Security sx={{ mr: 2 }} />
              <Typography variant="h6" noWrap component="div">
                Enterprise SOC Center
              </Typography>
              <Chip label="PRODUCTION" size="small" color="success" sx={{ ml: 2 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="الإشعارات">
                <IconButton color="inherit" onClick={handleNotifClick}>
                  <Badge badgeContent={4} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="المستخدم">
                <IconButton color="inherit">
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        {/* القائمة الجانبية */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #132f4c 0%, #0a1929 100%)',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', pt: 2 }}>
            {/* معلومات المؤسسة */}
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                <Business />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                شركة التقنية المتقدمة
              </Typography>
              <Chip label="TENANT: CORP-001" size="small" variant="outlined" color="primary" />
            </Box>
            <List>
              {navigationItems.map((item, index) => (
                <ListItem
                  button
                  key={item.text}
                  selected={activeTab === index}
                  onClick={() => {
                    setActiveTab(index);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            {/* حالة النظام */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom color="textSecondary">
                حالة النظام
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={85} color="success" sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  85%
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                جميع الخدمات نشطة
              </Typography>
            </Box>
          </Box>
        </Drawer>
        {/* المحتوى الرئيسي */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          {activeTab === 0 && <OverviewDashboard handleQuickAction={handleQuickAction} />}
          {activeTab === 1 && <ThreatIntelligenceDashboard />}
          {activeTab === 2 && <IncidentManagementDashboard />}
          {activeTab === 3 && <AssetManagementDashboard />}
          {activeTab === 4 && <NetworkMonitoringDashboard onShowTraffic={handleShowTraffic} />}
          {activeTab === 5 && <ReportsAnalyticsDashboard />}
          {activeTab === 6 && <SystemManagementDashboard />}
        </Box>
        {/* نافذة حوار للإجراءات السريعة */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>تنفيذ الإجراء</Typography>
            <Typography>{dialogMsg}</Typography>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={() => setDialogOpen(false)}>إغلاق</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة الإشعارات */}
        <Dialog open={notifOpen} onClose={() => setNotifOpen(false)}>
          <Box sx={{ p: 3, minWidth: 350 }}>
            <Typography variant="h6" gutterBottom>الإشعارات</Typography>
            {notifications.length === 0 ? (
              <Typography>لا توجد إشعارات جديدة حالياً.</Typography>
            ) : (
              <Box>
                {notifications.map((notif, idx) => (
                  <Paper key={idx} sx={{ p: 2, mb: 1, backgroundColor: notif.severity === 'critical' ? 'error.light' : 'background.paper' }}>
                    <Typography variant="body2" fontWeight="bold">{notif.title || notif.message}</Typography>
                    <Typography variant="caption" color="textSecondary">{notif.time}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={() => setNotifOpen(false)}>إغلاق</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة إدخال حادث جديد */}
        <Dialog open={incidentDialogOpen} onClose={() => setIncidentDialogOpen(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>تسجيل حادث جديد</Typography>
            <TextField label="العنوان" name="title" value={incidentForm.title} onChange={handleIncidentFormChange} fullWidth sx={{ mb: 2 }} />
            <TextField label="الوصف" name="description" value={incidentForm.description} onChange={handleIncidentFormChange} fullWidth multiline rows={3} sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="severity-label">درجة الخطورة</InputLabel>
              <Select labelId="severity-label" name="severity" value={incidentForm.severity} label="درجة الخطورة" onChange={handleIncidentFormChange}>
                <MenuItem value="critical">حرجة</MenuItem>
                <MenuItem value="high">عالية</MenuItem>
                <MenuItem value="medium">متوسطة</MenuItem>
                <MenuItem value="low">منخفضة</MenuItem>
              </Select>
            </FormControl>
            <TextField label="تاريخ الاكتشاف" name="date" type="date" value={incidentForm.date} onChange={handleIncidentFormChange} fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <Button variant="outlined" component="label" sx={{ mb: 2 }}>
              رفع مرفق
              <input type="file" name="attachment" hidden onChange={handleIncidentFormChange} />
            </Button>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleIncidentSubmit}>تسجيل</Button>
              <Button sx={{ ml: 1 }} onClick={() => setIncidentDialogOpen(false)}>إلغاء</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة تخصيص بدء المسح */}
        <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>بدء المسح</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="scan-type-label">نوع المسح</InputLabel>
              <Select labelId="scan-type-label" name="type" value={scanForm.type} label="نوع المسح" onChange={handleScanFormChange}>
                <MenuItem value="quick">سريع</MenuItem>
                <MenuItem value="full">كامل</MenuItem>
                <MenuItem value="custom">مخصص</MenuItem>
              </Select>
            </FormControl>
            <TextField label="الأصل المستهدف" name="asset" value={scanForm.asset} onChange={handleScanFormChange} fullWidth sx={{ mb: 2 }} />
            {scanForm.type === 'custom' && (
              <TextField label="النطاق أو الخيارات" name="range" value={scanForm.range} onChange={handleScanFormChange} fullWidth sx={{ mb: 2 }} />
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleScanSubmit}>بدء المسح</Button>
              <Button sx={{ ml: 1 }} onClick={() => setScanDialogOpen(false)}>إلغاء</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة تخصيص تحديث البيانات */}
        <Dialog open={refreshDialogOpen} onClose={() => setRefreshDialogOpen(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>تحديث البيانات</Typography>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={refreshTypes.assets} onChange={handleRefreshTypeChange} name="assets" />} label="الأصول" />
              <FormControlLabel control={<Checkbox checked={refreshTypes.threats} onChange={handleRefreshTypeChange} name="threats" />} label="التهديدات" />
              <FormControlLabel control={<Checkbox checked={refreshTypes.incidents} onChange={handleRefreshTypeChange} name="incidents" />} label="الحوادث" />
              <FormControlLabel control={<Checkbox checked={refreshTypes.system} onChange={handleRefreshTypeChange} name="system" />} label="النظام" />
            </FormGroup>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleRefreshSubmit}>تحديث</Button>
              <Button sx={{ ml: 1 }} onClick={() => setRefreshDialogOpen(false)}>إلغاء</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة تخصيص تقرير فوري */}
        <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>تقرير فوري</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="report-type-label">نوع التقرير</InputLabel>
              <Select labelId="report-type-label" name="type" value={reportForm.type} label="نوع التقرير" onChange={handleReportFormChange}>
                <MenuItem value="summary">ملخص</MenuItem>
                <MenuItem value="detailed">تفصيلي</MenuItem>
                <MenuItem value="by-section">حسب القسم</MenuItem>
              </Select>
            </FormControl>
            <TextField label="من تاريخ" name="from" type="date" value={reportForm.from} onChange={handleReportFormChange} fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="إلى تاريخ" name="to" type="date" value={reportForm.to} onChange={handleReportFormChange} fullWidth InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
            <TextField label="فلتر أو كلمة مفتاحية" name="filter" value={reportForm.filter} onChange={handleReportFormChange} fullWidth sx={{ mb: 2 }} />
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleReportSubmit}>جلب التقرير</Button>
              <Button sx={{ ml: 1 }} onClick={() => setReportDialogOpen(false)}>إلغاء</Button>
            </Box>
          </Box>
        </Dialog>
        {/* نافذة حركة المرور مع رسم بياني */}
        <Dialog open={trafficDialogOpen} onClose={() => setTrafficDialogOpen(false)}>
          <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" gutterBottom>حركة مرور الشبكة</Typography>
            {trafficLoading ? (
              <Typography>جاري جلب حركة المرور...</Typography>
            ) : trafficData.length === 0 ? (
              <Typography>لا توجد بيانات حركة مرور حالياً.</Typography>
            ) : (
              <>
                {trafficChartData && (
                  <Box sx={{ mb: 3 }}>
                    <Line data={trafficChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: false } }, scales: { y: { beginAtZero: true } } }} height={200} />
                  </Box>
                )}
                <Box>
                  {trafficData.map((row, idx) => (
                    <Paper key={idx} sx={{ p: 2, mb: 1 }}>
                      <Typography variant="body2">{row.info}</Typography>
                      <Typography variant="caption" color="textSecondary">{row.time}</Typography>
                    </Paper>
                  ))}
                </Box>
              </>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={() => setTrafficDialogOpen(false)}>إغلاق</Button>
            </Box>
          </Box>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};


// صفحة لوحة التهديدات
const ThreatIntelligenceDashboard = () => (
  <Box>
    <Typography variant="h4" gutterBottom>لوحة التهديدات</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>هنا ستظهر معلومات وتحليلات التهديدات السيبرانية.</Typography>
    </Paper>
  </Box>
);

// صفحة إدارة الحوادث
const IncidentManagementDashboard = () => (
  <Box>
    <Typography variant="h4" gutterBottom>إدارة الحوادث</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>هنا ستتم إدارة الحوادث الأمنية وتفاصيلها.</Typography>
    </Paper>
  </Box>
);

// صفحة مراقبة الأصول
const AssetManagementDashboard = () => (
  <Box>
    <Typography variant="h4" gutterBottom>مراقبة الأصول</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>هنا ستظهر بيانات الأصول ومراقبتها.</Typography>
    </Paper>
  </Box>
);

// صفحة تحليل الشبكة
const NetworkMonitoringDashboard = ({ onShowTraffic }) => {
  const [networkInfo, setNetworkInfo] = useState({
    ip: '',
    router: '',
    vpn: false,
    interfaces: [],
    details: '',
    speed: '',
    networkType: '',
    mac: ''
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchNetwork() {
      setLoading(true);
      try {
        // استدعاء API لجلب معلومات الشبكة الحقيقية
        const data = await enterpriseApi.getNetworkInfo();
        setNetworkInfo(data);
      } catch {
        setNetworkInfo({ ip: '', router: '', vpn: false, interfaces: [], details: 'تعذر جلب البيانات', speed: '', networkType: '', mac: '' });
      }
      setLoading(false);
    }
    fetchNetwork();
    // تحديث تلقائي كل دقيقة
    const interval = setInterval(fetchNetwork, 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Box>
      <Typography variant="h4" gutterBottom>تحليل الشبكة</Typography>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Typography>جاري جلب بيانات الشبكة...</Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>IP الجهاز: {networkInfo.ip || 'غير متوفر'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>MAC: {networkInfo.mac || 'غير متوفر'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>الراوتر: {networkInfo.router || 'غير متوفر'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>اتصال VPN: {networkInfo.vpn ? 'نعم' : 'لا'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>نوع الشبكة: {networkInfo.networkType || 'غير متوفر'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>سرعة الاتصال: {networkInfo.speed || 'غير متوفر'}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>تفاصيل الشبكة: {networkInfo.details || 'غير متوفر'}</Typography>
            <Typography variant="h6" sx={{ mt: 3 }}>واجهات الشبكة:</Typography>
            {networkInfo.interfaces.length === 0 ? (
              <Typography>لا توجد بيانات للواجهات.</Typography>
            ) : (
              <ul>
                {networkInfo.interfaces.map((iface, idx) => (
                  <li key={idx}>{iface}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </Paper>
      {/* أضف زر لعرض حركة المرور في واجهة الشبكة */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button variant="outlined" onClick={() => onShowTraffic && onShowTraffic()}>عرض حركة المرور</Button>
      </Box>
    </Box>
  );
};

// صفحة التقارير والتحليلات
const ReportsAnalyticsDashboard = () => (
  <Box>
    <Typography variant="h4" gutterBottom>التقارير والتحليلات</Typography>
    <Paper sx={{ p: 3 }}>
      <Typography>هنا ستظهر تقارير وتحليلات النظام.</Typography>
    </Paper>
  </Box>
);

// صفحة إدارة النظام
const SystemManagementDashboard = () => {
  const [settings, setSettings] = useState({
    socName: 'شركة التقنية المتقدمة',
    alertEmail: '',
    enableNotifications: true,
    backupFrequency: 'daily',
    language: 'ar',
    darkMode: true
  });
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleSaveSettings = () => {
    // هنا يمكن ربط الإعدادات بالbackend
    alert('تم حفظ إعدادات النظام بنجاح!');
  };
  return (
    <Box>
      <Typography variant="h4" gutterBottom>إعدادات النظام</Typography>
      <Paper sx={{ p: 3, maxWidth: 500 }}>
        <TextField label="اسم مركز العمليات" name="socName" value={settings.socName} onChange={handleSettingsChange} fullWidth sx={{ mb: 2 }} />
        <TextField label="بريد التنبيهات" name="alertEmail" value={settings.alertEmail} onChange={handleSettingsChange} fullWidth sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="backup-frequency-label">تكرار النسخ الاحتياطي</InputLabel>
          <Select labelId="backup-frequency-label" name="backupFrequency" value={settings.backupFrequency} label="تكرار النسخ الاحتياطي" onChange={handleSettingsChange}>
            <MenuItem value="daily">يومي</MenuItem>
            <MenuItem value="weekly">أسبوعي</MenuItem>
            <MenuItem value="monthly">شهري</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="language-label">اللغة</InputLabel>
          <Select labelId="language-label" name="language" value={settings.language} label="اللغة" onChange={handleSettingsChange}>
            <MenuItem value="ar">العربية</MenuItem>
            <MenuItem value="en">الإنجليزية</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel control={<Checkbox checked={settings.enableNotifications} onChange={handleSettingsChange} name="enableNotifications" />} label="تفعيل الإشعارات" />
        <FormControlLabel control={<Checkbox checked={settings.darkMode} onChange={handleSettingsChange} name="darkMode" />} label="الوضع الليلي" />
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button variant="contained" onClick={handleSaveSettings}>حفظ الإعدادات</Button>
        </Box>
      </Paper>
    </Box>
  );
};

// لوحة النظرة العامة
const OverviewDashboard = ({ handleQuickAction }) => {
  const [metrics] = useState({
    securityScore: 87,
    activeIncidents: 12,
    threatsBlocked: 24567,
    vulnerabilities: 342,
    complianceScore: 92,
    systemUptime: 99.98
  });

  const threatTimelineData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'التهديدات الحرجة',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'التهديدات العالية',
        data: [18, 12, 6, 8, 4, 7],
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        🛡️ نظرة عامة على مركز عمليات الأمن
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="التقييم الأمني" value={metrics.securityScore} unit="/100" icon={<Security />} color="primary" trend={{ value: 2.5, isPositive: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="الحوادث النشطة" value={metrics.activeIncidents} icon={<Warning />} color="warning" trend={{ value: 3, isPositive: false }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="التهديدات المحظورة" value={metrics.threatsBlocked} icon={<Lock />} color="success" trend={{ value: 15.7, isPositive: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="درجة الامتثال" value={metrics.complianceScore} unit="%" icon={<BarChart />} color="info" trend={{ value: 1.2, isPositive: true }} />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              📊 توزيع التهديدات خلال 24 ساعة
            </Typography>
            <Line data={threatTimelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } } } }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              🚨 التهديدات الفورية
            </Typography>
            <RealTimeThreatsList />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              ⚙️ حالة النظام
            </Typography>
            <SystemHealthMonitor />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎯 الإجراءات السريعة
            </Typography>
            <QuickActions onAction={handleQuickAction} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const MetricCard = ({ title, value, unit, icon, color, trend }) => (
  <Card sx={{ position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color + '.main'}>
            {value}
            {unit && <Typography variant="h6" component="span" color="textSecondary">{unit}</Typography>}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="body2" color={trend.isPositive ? 'success.main' : 'error.main'} sx={{ display: 'flex', alignItems: 'center' }}>
              {trend.isPositive ? '↗' : '↘'} {trend.value}%
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              عن الشهر الماضي
            </Typography>
          </Box>
        </Box>
        <Box sx={{ backgroundColor: color + '.main', borderRadius: '50%', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { fontSize: 32, color: 'white' } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const RealTimeThreatsList = () => {
  const threats = [
    { id: 1, severity: 'critical', message: 'محاولة اختراق خادم قاعدة البيانات', time: '2 دقائق', source: '192.168.1.100' },
    { id: 2, severity: 'high', message: 'نشاط غير عادي للمستخدم', time: '5 دقائق', source: 'user-john' },
    { id: 3, severity: 'medium', message: 'ثغرة أمنية مكتشفة', time: '15 دقيقة', source: 'web-server-01' },
    { id: 4, severity: 'low', message: 'تحديثات أمنية متاحة', time: '30 دقيقة', source: 'System' }
  ];
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[severity];
  };
  return (
    <Box>
      {threats.map((threat) => (
        <Card key={threat.id} sx={{ mb: 2, borderLeft: 4, borderColor: getSeverityColor(threat.severity) + '.main' }}>
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" gutterBottom>{threat.message}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Chip label={threat.severity} size="small" color={getSeverityColor(threat.severity)} />
                  <Typography variant="caption" color="textSecondary">{threat.time}</Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const SystemHealthMonitor = () => {
  const systems = [
    { name: 'محرك الأحداث', status: 'healthy', usage: 45 },
    { name: 'قاعدة البيانات', status: 'healthy', usage: 72 },
    { name: 'التخزين', status: 'warning', usage: 89 },
    { name: 'الشبكة', status: 'healthy', usage: 34 },
    { name: 'النسخ الاحتياطي', status: 'error', usage: 0 }
  ];
  const getStatusColor = (status) => {
    const colors = {
      healthy: 'success',
      warning: 'warning',
      error: 'error'
    };
    return colors[status];
  };
  return (
    <Box>
      {systems.map((system, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{system.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">{system.usage}%</Typography>
              <Chip label={system.status} size="small" color={getStatusColor(system.status)} variant="outlined" />
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={system.usage} color={getStatusColor(system.status)} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      ))}
    </Box>
  );
};

const QuickActions = ({ onAction }) => {
  const actions = [
    { icon: <PlayArrow />, label: 'بدء المسح', color: 'primary' },
    { icon: <Refresh />, label: 'تحديث البيانات', color: 'info' },
    { icon: <Add />, label: 'حادث جديد', color: 'warning' },
    { icon: <BarChart />, label: 'تقرير فوري', color: 'success' }
  ];
  return (
    <Grid container spacing={2}>
      {actions.map((action, index) => (
        <Grid item xs={6} key={index}>
          <Card sx={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }} onClick={() => onAction(action.label)}>
            <CardContent sx={{ py: 3 }}>
              <Box sx={{ backgroundColor: action.color + '.main', borderRadius: '50%', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
                {React.cloneElement(action.icon, { sx: { color: 'white', fontSize: 24 } })}
              </Box>
              <Typography variant="body2" fontWeight="medium">{action.label}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default EnterpriseSOCDashboard;
