require('dotenv').config();

const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/findash_test_db';
  process.env.DATABASE_URL = testDbUrl;

  const testUrl = new URL(testDbUrl);
  const dbName = testUrl.pathname.slice(1);

  testUrl.pathname = '/postgres';
  const adminClient = new Client({ connectionString: testUrl.toString() });
  await adminClient.connect();
  try {
    await adminClient.query(`CREATE DATABASE ${dbName}`);
  } catch {
    // database already exists
  }
  await adminClient.end();

  const client = new Client({ connectionString: testDbUrl });
  await client.connect();

  await client.query('DROP TABLE IF EXISTS trades CASCADE');
  await client.query('DROP TABLE IF EXISTS users CASCADE');
  await client.query('DROP TABLE IF EXISTS clients CASCADE');

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    .split('\n')
    .filter(line => !line.trim().startsWith('\\c') && !line.trim().startsWith('CREATE DATABASE'))
    .join('\n');

  const schemaStatements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  for (const stmt of schemaStatements) {
    await client.query(stmt);
  }

  const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf8')
    .split('\n')
    .filter(line => !line.trim().startsWith('\\c'))
    .join('\n');

  const seedStatements = seedSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  for (const stmt of seedStatements) {
    await client.query(stmt);
  }

  const adminHash = await bcrypt.hash('adminpass', 10);
  const analystHash = await bcrypt.hash('analystpass', 10);
  const viewerHash = await bcrypt.hash('viewerpass', 10);

  await client.query(
    `INSERT INTO users (username, password_hash, role) VALUES
     ($1, $2, 'admin'),
     ($3, $4, 'analyst'),
     ($5, $6, 'viewer')`,
    ['admin', adminHash, 'analyst', analystHash, 'viewer', viewerHash]
  );

  await client.end();
};
