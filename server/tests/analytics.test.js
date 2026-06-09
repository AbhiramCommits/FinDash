const request = require('supertest');
const app = require('../index');

let adminToken;
let viewerToken;

beforeAll(async () => {
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'adminpass' });
  adminToken = adminRes.body.token;

  const viewerRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'viewer', password: 'viewerpass' });
  viewerToken = viewerRes.body.token;
});

describe('GET /api/analytics/summary', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/analytics/summary');
    expect(res.status).toBe(401);
  });

  it('returns 200 and body contains total_trades with valid token', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_trades');
  });
});

describe('GET /api/analytics/tca', () => {
  it('returns 200 and an array for valid params', async () => {
    const res = await request(app)
      .get('/api/analytics/tca')
      .query({ start: '2020-01-01', end: '2030-12-31' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 400 when start param is missing', async () => {
    const res = await request(app)
      .get('/api/analytics/tca')
      .query({ end: '2030-12-31' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/analytics/clients', () => {
  it('returns 403 for viewer role', async () => {
    const res = await request(app)
      .get('/api/analytics/clients')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
  });
});
