// Integration tests against an in-memory MongoDB (no external database, no network service).
// They check the existing tenant-scoped query code and model validation.
// They do NOT make the API usable: auth and tenant policy are still undecided and the API fails closed.
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const SecurityEvent = require('../models/SecurityEvent');
const Incident = require('../models/Incident');
const service = require('../services/AdvancedQueryService');

let mongod;
jest.setTimeout(120000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await SecurityEvent.init();
  await Incident.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await SecurityEvent.deleteMany({});
  await Incident.deleteMany({});
});

const ev = (tenant, id, extra = {}) => ({
  event_id: id,
  tenant_id: tenant,
  severity: 'high',
  behavioral_analysis: { anomaly_score: 95 },
  ...extra
});

describe('AdvancedQueryService is tenant-scoped', () => {
  test('findHighRiskEvents returns only the asked tenant and only high-risk events', async () => {
    await SecurityEvent.create([
      ev('T1', 'e1'),
      ev('T2', 'e2'),
      ev('T1', 'e3', { severity: 'low' }),
      ev('T1', 'e4', { behavioral_analysis: { anomaly_score: 10 } })
    ]);
    const rows = await service.findHighRiskEvents('T1');
    expect(rows.map((r) => r.event_id)).toEqual(['e1']);
  });

  test('bulkCloseStaleIncidents never touches another tenant', async () => {
    const old = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    await Incident.collection.insertMany([
      { incident_id: 'i1', tenant_id: 'T1', title: 'a', status: 'new', severity: 'low', created_at: old, createdAt: old },
      { incident_id: 'i2', tenant_id: 'T2', title: 'b', status: 'new', severity: 'low', created_at: old, createdAt: old }
    ]);
    await service.bulkCloseStaleIncidents('T1', 7);
    const t2 = await Incident.findOne({ incident_id: 'i2' }).lean();
    expect(t2.status).toBe('new');
  });
});

describe('model validation (documents current behaviour)', () => {
  test('an incident without tenant_id is rejected', async () => {
    await expect(new Incident({ title: 'x', severity: 'low' }).save()).rejects.toThrow(/tenant_id/);
  });

  test("status 'detected' (what createIncident sets) is not in the model enum", async () => {
    await expect(new Incident({ title: 'x', tenant_id: 'T1', status: 'detected' }).save()).rejects.toThrow(/status/);
  });

  test('a valid incident saves', async () => {
    const doc = await new Incident({ title: 'x', tenant_id: 'T1', severity: 'low' }).save();
    expect(doc.status).toBe('new');
  });
});
