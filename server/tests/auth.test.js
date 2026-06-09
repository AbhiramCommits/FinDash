const request = require('supertest');
const app = require('../index');

describe('POST /api/auth/login', () => {
  it('returns 200 and a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpass' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});

describe('POST /api/auth/register', () => {
  it('returns 403 when called without an admin token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'analyst', password: 'analystpass' });

    const analystToken = loginRes.body.token;

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ username: 'newuser', password: 'secret123', role: 'viewer' });

    expect(res.status).toBe(403);
  });
});
