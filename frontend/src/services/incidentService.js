import api from './api';

export const incidentService = {
  // Get all incidents
  getAll: async () => {
    const response = await api.get('/incidents');
    return response.data;
  },

  // Get incident by ID
  getById: async (id) => {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  },

  // Create new incident
  create: async (incidentData) => {
    const response = await api.post('/incidents', incidentData);
    return response.data;
  },

  // Update incident
  update: async (id, incidentData) => {
    const response = await api.put(`/incidents/${id}`, incidentData);
    return response.data;
  },

  // Delete incident
  delete: async (id) => {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  },

  // Get active incidents
  getActive: async () => {
    const response = await api.get('/incidents/status/active');
    return response.data;
  },

  // Get incidents by severity
  getBySeverity: async (severity) => {
    const response = await api.get(`/incidents/severity/${severity}`);
    return response.data;
  }
};
