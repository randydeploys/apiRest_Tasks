// tests/auth.test.js
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB, clearDB } from './setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
afterEach(async () => await clearDB());

describe('POST /api/auth/register', () => {

  it('devrait créer un utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@mail.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.user.name).toBe('Alice');
    expect(res.body.token).toBeDefined();
  });

  it('devrait refuser un email en doublon', async () => {
    // Créer un premier user
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@mail.com', password: 'secret123' });

    // Essayer de recréer avec le même email
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'alice@mail.com', password: 'secret456' });

    expect(res.status).toBe(400);
  });

  it('devrait refuser si champs manquants', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@mail.com' }); // pas de name ni password

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@mail.com', password: 'secret123' });
  });

  it('devrait connecter avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@mail.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Alice');
  });

  it('devrait refuser un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@mail.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});