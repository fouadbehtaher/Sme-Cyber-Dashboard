import React, { useState, useEffect } from 'react';
import '../dashboard/dashboard.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';
import { incidentService } from '../../services';

const IncidentList = ({ onViewIncident, onEditIncident, refreshTrigger }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getAll();
      setIncidents(data);
      setError('');
    } catch (err) {
      setError('Failed to load incidents');
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [refreshTrigger]);

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      detected: 'error',
      investigating: 'warning',
      contained: 'info',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  const handleDelete = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await incidentService.delete(incidentId);
        loadIncidents(); // Reload the list
      } catch (err) {
        setError('Failed to delete incident');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="card">
      <Typography variant="h5" gutterBottom>
        قائمة الحوادث الأمنية
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>العنوان</TableCell>
              <TableCell>النوع</TableCell>
              <TableCell>الخطورة</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident._id}>
                <TableCell>{incident.title}</TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={incident.severity} 
                    color={getSeverityColor(incident.severity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={incident.status} 
                    color={getStatusColor(incident.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(incident.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => onViewIncident(incident)}
                    color="primary"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onEditIncident(incident)}
                    color="secondary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(incident._id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {incidents.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          لا توجد حوادث.
        </Alert>
      )}
    </div>
  );
};

export default IncidentList;
