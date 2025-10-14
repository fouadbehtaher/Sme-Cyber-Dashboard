import React, { useState, useEffect } from 'react';
import './dashboard.css';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { vulnerabilityService, incidentService } from '../services';

const MainDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    securityScore: 0,
    activeIncidents: 0,
    criticalVulnerabilities: 0,
    assetsCount: 0,
    threatTimeline: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [vulns, incidents, assets] = await Promise.all([
        vulnerabilityService.getSummary(),
        incidentService.getActive(),
        assetService.getCount()
      ]);
      
      setDashboardData({
        securityScore: calculateSecurityScore(vulns, incidents),
        activeIncidents: incidents.length,
        criticalVulnerabilities: vulns.critical,
        assetsCount: assets.total,
        threatTimeline: vulns.timeline
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const calculateSecurityScore = (vulns, incidents) => {
    const baseScore = 100;
    const vulnPenalty = vulns.critical * 5 + vulns.high * 2;
    const incidentPenalty = incidents.length * 3;
    return Math.max(0, baseScore - vulnPenalty - incidentPenalty);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-logo">لوحة التحكم السيبرانية</div>
        <div className="navbar-links">
          <a href="/" className="navbar-link">الرئيسية</a>
          <a href="/incidents" className="navbar-link">الحوادث</a>
          <a href="/assets" className="navbar-link">الأصول</a>
          <a href="/vulnerabilities" className="navbar-link">الثغرات</a>
        </div>
      </nav>
      <h2 className="dashboard-title">لوحة معلومات التعرض السيبراني</h2>
      <Grid container spacing={3}>
        {/* Security Score Card */}
        <Grid item xs={12} sm={6} md={3}>
          <div className="card">
            <div style={{ color: '#888', marginBottom: '8px' }}>معدل الأمان</div>
            <div style={{ fontSize: '2rem', color: dashboardData.securityScore > 70 ? 'green' : dashboardData.securityScore > 40 ? 'orange' : 'red' }}>
              {dashboardData.securityScore}
            </div>
          </div>
        </Grid>

        {/* Active Incidents Card */}
        <Grid item xs={12} sm={6} md={3}>
          <div className="card">
            <div style={{ color: '#888', marginBottom: '8px' }}>الحوادث النشطة</div>
            <div style={{ fontSize: '2rem' }}>{dashboardData.activeIncidents}</div>
          </div>
        </Grid>

        {/* Threat Timeline Chart */}
        <Grid item xs={12}>
          <div className="card">
            <div style={{ color: '#888', marginBottom: '8px' }}>تسلسل التهديدات</div>
            <LineChart width={800} height={300} data={dashboardData.threatTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="threats" stroke="#8884d8" />
              <Line type="monotone" dataKey="incidents" stroke="#82ca9d" />
            </LineChart>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default MainDashboard;
