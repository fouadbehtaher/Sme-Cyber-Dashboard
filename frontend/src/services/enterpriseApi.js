// Enterprise API Service
// تم النسخ من طلبك
import axios from 'axios';

class EnterpriseAPIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_BASE_URL;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // طلب interceptors
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('soc_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['X-Tenant-ID'] = localStorage.getItem('tenant_id');
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // رد interceptors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  // حوادث
  async getIncidents(params = {}) {
    const response = await this.axiosInstance.get('/api/v1/incidents', { params });
    return response.data;
  }

  async createIncident(incidentData) {
    const response = await this.axiosInstance.post('/api/v1/incidents', incidentData);
    return response.data;
  }

  async updateIncident(incidentId, updates) {
    const response = await this.axiosInstance.put(`/api/v1/incidents/${incidentId}`, updates);
    return response.data;
  }

  // الأصول
  async getAssets(params = {}) {
    const response = await this.axiosInstance.get('/api/v1/assets', { params });
    return response.data;
  }

  // التهديدات
  async getThreatIntelligence() {
    const response = await this.axiosInstance.get('/api/v1/threat-intelligence');
    return response.data;
  }

  // المقاييس
  async getSecurityMetrics() {
    const response = await this.axiosInstance.get('/api/v1/metrics/security');
    return response.data;
  }

  async getSystemHealth() {
    const response = await this.axiosInstance.get('/api/v1/metrics/system-health');
    return response.data;
  }

  // WebSocket للبيانات الحية
  initializeWebSocket() {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // مصادقة WebSocket
      ws.send(JSON.stringify({
        type: 'auth',
        token: localStorage.getItem('soc_token'),
        tenant: localStorage.getItem('tenant_id')
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleRealtimeData(data);
    };

    return ws;
  }

  handleRealtimeData(data) {
    // معالجة البيانات الحية
    switch (data.type) {
      case 'new_incident':
        // تحديث لوحة الحوادث
        break;
      case 'threat_alert':
        // إشعار تهديد جديد
        break;
      case 'system_metric':
        // تحديث المقاييس
        break;
    }
  }

  // إضافة دالة بدء المسح
  async startScan(scanType = 'full') {
    // يمكنك تعديل endpoint حسب ما هو متاح في backend
    const response = await this.axiosInstance.post('/api/v1/scan', { type: scanType });
    return response.data;
  }

  // إضافة دالة تحديث البيانات
  async refreshData() {
    const response = await this.axiosInstance.post('/api/v1/refresh');
    return response.data;
  }

  // إضافة دالة جلب تقرير فوري
  async getInstantReport(params = {}) {
    const response = await this.axiosInstance.get('/api/v1/reports/instant', { params });
    return response.data;
  }

  // تحديث دالة جلب معلومات الشبكة في خدمة enterpriseApi
  async getNetworkInfo() {
    const response = await this.axiosInstance.get('/api/v1/network/info');
    // يجب أن يعيد backend: ip, mac, router, vpn, interfaces, details, speed, networkType
    return response.data;
  }

  // إضافة دالة جلب حركة المرور في خدمة enterpriseApi
  async getNetworkTraffic() {
    const response = await this.axiosInstance.get('/api/v1/network/traffic');
    // يجب أن يعيد backend: time, src, dst, protocol, size لكل صف
    return response.data;
  }
}

export default new EnterpriseAPIService();
