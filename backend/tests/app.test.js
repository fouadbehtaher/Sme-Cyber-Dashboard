const request = require('supertest');

jest.mock('../models/Incident', () => ({
  find: jest.fn(),
  countDocuments: jest.fn()
}));
jest.mock('../models/Asset', () => ({}), { virtual: false });

const Incident = require('../models/Incident');
const app = require('../app');

describe('backend boot (no database, no network)', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unmounted routes return 404, not a crash', async () => {
    for (const path of ['/api/auth/login', '/api/assets', '/api/advanced-queries/high-risk-events']) {
      const res = await request(app).get(path);
      expect(res.status).toBe(404);
    }
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
    const res = await request(app).get('/api/incidents?severity=high&status=open');
    expect(res.status).toBe(200);
    expect(Incident.find).toHaveBeenCalledWith({ severity: 'high', status: 'open' });
    expect(res.body.total).toBe(1);
    expect(res.body.incidents).toHaveLength(1);
  });

  test('fixed-path incident routes are not captured by /:id', async () => {
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue([]) };
    Incident.find.mockReturnValue(chain);
    const active = await request(app).get('/api/incidents/status/active');
    expect(active.status).toBe(200);
    expect(Incident.find).toHaveBeenLastCalledWith({ status: { $nin: ['resolved', 'closed'] } });
    const sev = await request(app).get('/api/incidents/severity/high');
    expect(sev.status).toBe(200);
    expect(Incident.find).toHaveBeenLastCalledWith({ severity: 'high' });
  });

  test('PUT and DELETE /:id are not mounted', async () => {
    expect((await request(app).put('/api/incidents/abc')).status).toBe(404);
    expect((await request(app).delete('/api/incidents/abc')).status).toBe(404);
  });
});
