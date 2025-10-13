import React, { useState, useEffect } from 'react';
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cyber Exposure Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Security Score Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Security Score
              </Typography>
              <Typography variant="h4" component="div" 
                sx={{ color: dashboardData.securityScore > 70 ? 'green' : 
                         dashboardData.securityScore > 40 ? 'orange' : 'red' }}>
                {dashboardData.securityScore}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Incidents Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Incidents
              </Typography>
              <Typography variant="h4" component="div">
                {dashboardData.activeIncidents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Threat Timeline Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Threat Timeline
            </Typography>
            <LineChart width={800} height={300} data={dashboardData.threatTimeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="threats" stroke="#8884d8" />
              <Line type="monotone" dataKey="incidents" stroke="#82ca9d" />
            </LineChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainDashboard;
