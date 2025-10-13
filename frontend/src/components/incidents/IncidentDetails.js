import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  TextField,
  MenuItem
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { incidentService } from '../../services';

const IncidentDetails = ({ incident, open, onClose, onUpdate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [actionNote, setActionNote] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  useEffect(() => {
    if (incident) {
      // Set active step based on incident status
      const statusSteps = {
        detected: 0,
        investigating: 1,
        contained: 2,
        resolved: 3
      };
      setActiveStep(statusSteps[incident.status] || 0);
    }
  }, [incident]);

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity];
  };

  const getStatusColor = (status) => {
    const colors = {
      detected: 'error',
      investigating: 'warning',
      contained: 'info',
      resolved: 'success'
    };
    return colors[status];
  };

  const responseActions = [
    'isolate_host',
    'block_ip',
    'enable_mfa',
    'reset_password',
    'update_firewall',
    'scan_network',
    'notify_team',
    'escalate_management'
  ];

  const handleStatusUpdate = async (newStatus) => {
    try {
      const updatedIncident = await incidentService.updateStatus(incident._id, {
        status: newStatus,
        response_actions: [
          ...(incident.response_actions || []),
          {
            action: `Status changed to ${newStatus}`,
            note: actionNote,
            timestamp: new Date()
          }
        ]
      });
      onUpdate(updatedIncident);
      setActionNote('');
    } catch (error) {
      console.error('Failed to update incident:', error);
    }
  };

  const handleAddAction = async () => {
    if (!selectedAction) return;

    try {
      const updatedIncident = await incidentService.updateStatus(incident._id, {
        response_actions: [
          ...(incident.response_actions || []),
          {
            action: selectedAction,
            note: actionNote,
            timestamp: new Date(),
            status: 'completed'
          }
        ]
      });
      onUpdate(updatedIncident);
      setSelectedAction('');
      setActionNote('');
    } catch (error) {
      console.error('Failed to add action:', error);
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{incident.title}</Typography>
          <Box>
            <Chip 
              label={incident.severity} 
              color={getSeverityColor(incident.severity)}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={incident.status} 
              color={getStatusColor(incident.status)}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Incident Timeline */}
          <Grid item xs={12}>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Detected</StepLabel>
                <StepContent>
                  <Typography>Incident initially detected and logged</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(incident.created_at).toLocaleString()}
                  </Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Investigating</StepLabel>
                <StepContent>
                  <Typography>Root cause analysis and impact assessment</Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Contained</StepLabel>
                <StepContent>
                  <Typography>Threat contained and mitigation applied</Typography>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Resolved</StepLabel>
                <StepContent>
                  <Typography>Incident fully resolved and lessons learned</Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Grid>

          {/* Incident Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Details</Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Type" secondary={incident.type} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Source IP" secondary={incident.source_ip || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Destination IP" secondary={incident.destination_ip || 'Unknown'} />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Detected By" 
                    secondary={incident.detected_by || 'Manual'} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Affected Assets */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Affected Assets</Typography>
              {incident.affected_assets && incident.affected_assets.length > 0 ? (
                <List dense>
                  {incident.affected_assets.map((asset, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={asset.name} 
                        secondary={`${asset.type} - ${asset.ip_address}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">No assets specified</Typography>
              )}
            </Paper>
          </Grid>

          {/* Response Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Response Actions</Typography>
              
              {/* Add New Action */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Response Action"
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                    >
                      {responseActions.map((action) => (
                        <MenuItem key={action} value={action}>
                          {action.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Action Note"
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button 
                      variant="contained" 
                      onClick={handleAddAction}
                      disabled={!selectedAction}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Actions Timeline */}
              {incident.response_actions && incident.response_actions.length > 0 ? (
                <Timeline>
                  {incident.response_actions.map((action, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" />
                        {index < incident.response_actions.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(action.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="body1">
                          {action.action}
                        </Typography>
                        {action.note && (
                          <Typography variant="body2" color="textSecondary">
                            {action.note}
                          </Typography>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Alert severity="info">No response actions recorded yet</Alert>
              )}
            </Paper>
          </Grid>

          {/* Status Update */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Update Status</Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {['investigating', 'contained', 'resolved'].map((status) => (
                  <Button
                    key={status}
                    variant={incident.status === status ? "contained" : "outlined"}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={incident.status === status}
                  >
                    Mark as {status}
                  </Button>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentDetails;
