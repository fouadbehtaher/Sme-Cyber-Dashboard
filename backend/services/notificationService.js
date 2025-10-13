const WebSocket = require('ws');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.connections = new Set();
    this.setupEmailTransport();
  }

  setupEmailTransport() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  addConnection(ws) {
    this.connections.add(ws);
    console.log(`New WebSocket connection. Total: ${this.connections.size}`);
  }

  removeConnection(ws) {
    this.connections.delete(ws);
    console.log(`WebSocket disconnected. Total: ${this.connections.size}`);
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  async sendAlert(incident) {
    const alertMessage = this.createAlertMessage(incident);
    
    // Broadcast to WebSocket connections
    this.broadcast({
      type: 'INCIDENT_ALERT',
      data: incident,
      message: alertMessage,
      timestamp: new Date()
    });

    // Send email notification for high severity incidents
    if (['high', 'critical'].includes(incident.severity)) {
      await this.sendEmailAlert(incident, alertMessage);
    }

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(incident, alertMessage);
    }
  }

  createAlertMessage(incident) {
    return `🚨 SECURITY INCIDENT ALERT
Title: ${incident.title}
Severity: ${incident.severity.toUpperCase()}
Type: ${incident.type}
Time: ${new Date(incident.created_at).toLocaleString()}
Status: ${incident.status}`;
  }

  async sendEmailAlert(incident, message) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ALERT_EMAILS,
        subject: `🚨 Security Incident: ${incident.title}`,
        text: message,
        html: this.createEmailHTML(incident)
      });
      console.log('Email alert sent successfully');
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  createEmailHTML(incident) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">🚨 Security Incident Alert</h2>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h3>${incident.title}</h3>
          <p><strong>Severity:</strong> 
            <span style="color: ${
              incident.severity === 'critical' ? '#d32f2f' : 
              incident.severity === 'high' ? '#f57c00' : 
              incident.severity === 'medium' ? '#fbc02d' : '#388e3c'
            }">${incident.severity.toUpperCase()}</span>
          </p>
          <p><strong>Type:</strong> ${incident.type}</p>
          <p><strong>Status:</strong> ${incident.status}</p>
          <p><strong>Time Detected:</strong> ${new Date(incident.created_at).toLocaleString()}</p>
        </div>
        <div style="margin-top: 20px;">
          <p><strong>Description:</strong></p>
          <p>${incident.description}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
          <p><strong>Recommended Actions:</strong></p>
          <ul>
            <li>Review incident details in the dashboard</li>
            <li>Assess impact on affected systems</li>
            <li>Implement containment measures</li>
            <li>Update incident status as progress is made</li>
          </ul>
        </div>
      </div>
    `;
  }

  async sendSlackAlert(incident, message) {
    try {
      const slackMessage = {
        text: message,
        attachments: [
          {
            color: incident.severity === 'critical' ? '#d32f2f' : 
                   incident.severity === 'high' ? '#f57c00' : '#fbc02d',
            fields: [
              {
                title: 'Severity',
                value: incident.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Type',
                value: incident.type,
                short: true
              },
              {
                title: 'Status',
                value: incident.status,
                short: true
              }
            ]
          }
        ]
      };

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  // Method to send real-time dashboard updates
  sendDashboardUpdate(stats) {
    this.broadcast({
      type: 'DASHBOARD_UPDATE',
      data: stats,
      timestamp: new Date()
    });
  }
}

module.exports = new NotificationService();
