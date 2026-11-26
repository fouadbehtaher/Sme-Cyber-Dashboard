const request = require('supertest');

jest.mock('../models/Incident', () => ({
  find: jest.fn(),
  countDocuments: jest.fn()
}));
jest.mock('../models/Asset', () => ({}), { virtual: false });

const Incident = require('../models/Incident');
const express = require('express');
const app = require('../app');
// The real app disables all data routes. These handler tests mount the router on a throwaway app.
const handlerApp = express();
handlerApp.use(express.json());
handlerApp.use('/api/incidents', require('../routes/incidents'));

describe('backend (no database, no network; model calls are mocked)', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('health works and reveals nothing about the database', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('every data endpoint is rejected by default (reads and writes)', async () => {
    const cases = [
      ['get', '/api/incidents'], ['get', '/api/incidents/stats'], ['get', '/api/incidents/abc'],
      ['post', '/api/incidents'], ['put', '/api/incidents/abc/status'], ['delete', '/api/incidents/abc'],
      ['get', '/api/auth/login'], ['get', '/api/assets'], ['get', '/api/advanced-queries/high-risk-events']
    ];
    for (const [method, path] of cases) {
      const res = await request(app)[method](path).send({});
      expect(res.status).toBe(503);
    }
    expect(Incident.find).not.toHaveBeenCalled();
  });

  test('GET /api/incidents applies filters and paging', async () => {
    const chain = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValue([{ title: 'x' }])
    };
    Incident.find.mockReturnValue(chain);
    Incident.countDocuments.mockResolvedValue(1);
    const res = await request(handlerApp).get('/api/incidents?severity=high&status=open');
    expect(res.status).toBe(200);
    expect(Incident.find).toHaveBeenCalledWith({ severity: 'high', status: 'open' });
    expect(res.body.total).toBe(1);
    expect(res.body.incidents).toHaveLength(1);
  });

  test('fixed-path incident routes are not captured by /:id', async () => {
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
    Incident.find.mockReturnValue(chain);
    const active = await request(handlerApp).get('/api/incidents/status/active');
    expect(active.status).toBe(200);
    expect(Incident.find).toHaveBeenLastCalledWith({ status: { $nin: ['resolved', 'closed'] } });
    const sev = await request(handlerApp).get('/api/incidents/severity/high');
    expect(sev.status).toBe(200);
    expect(Incident.find).toHaveBeenLastCalledWith({ severity: 'high' });
  });

  test('PUT and DELETE /:id are not mounted', async () => {
    expect((await request(handlerApp).put('/api/incidents/abc')).status).toBe(404);
    expect((await request(handlerApp).delete('/api/incidents/abc')).status).toBe(404);
  });
});
