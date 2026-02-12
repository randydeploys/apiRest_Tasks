// tests/tasks.test.js
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB, clearDB } from './setup.js';

beforeAll(async () => await connectDB());
afterAll(async () => await disconnectDB());
afterEach(async () => await clearDB());

// Helper : créer un user et récupérer son token
async function getToken(email = 'alice@mail.com') {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Alice', email, password: 'secret123' });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'secret123' });

  return res.body.token;
}

describe('POST /api/tasks', () => {

  it('devrait créer une tâche', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Ma tâche', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Ma tâche');
    expect(res.body.data.priority).toBe('high');
    expect(res.body.data.completed).toBe(false);
  });

  it('devrait refuser sans token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Ma tâche' });

    expect(res.status).toBe(401);
  });

  it('devrait refuser un titre trop court', async () => {
    const token = await getToken();

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'A' }); // min 2 caractères

    expect(res.status).toBe(400);
  });
});

describe('GET /api/tasks', () => {

  it('devrait retourner seulement mes tâches', async () => {
    const tokenAlice = await getToken('alice@mail.com');
    const tokenBob = await getToken('bob@mail.com');

    // Alice crée 2 tâches
    await request(app).post('/api/tasks')
      .set('Authorization', `Bearer ${tokenAlice}`)
      .send({ title: 'Tâche Alice 1' });
    await request(app).post('/api/tasks')
      .set('Authorization', `Bearer ${tokenAlice}`)
      .send({ title: 'Tâche Alice 2' });

    // Bob crée 1 tâche
    await request(app).post('/api/tasks')
      .set('Authorization', `Bearer ${tokenBob}`)
      .send({ title: 'Tâche Bob' });

    // Alice ne voit que ses 2 tâches
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenAlice}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('PUT /api/tasks/:id', () => {

  it('devrait modifier ma tâche', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Avant' });

    const res = await request(app)
      .put(`/api/tasks/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Après', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Après');
    expect(res.body.data.completed).toBe(true);
  });

  it('devrait interdire de modifier la tâche d\'un autre', async () => {
    const tokenAlice = await getToken('alice@mail.com');
    const tokenBob = await getToken('bob@mail.com');

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenAlice}`)
      .send({ title: 'Tâche Alice' });

    const res = await request(app)
      .put(`/api/tasks/${created.body.data._id}`)
      .set('Authorization', `Bearer ${tokenBob}`)
      .send({ title: 'Volé par Bob' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/tasks/:id', () => {

  it('devrait supprimer ma tâche', async () => {
    const token = await getToken();

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'À supprimer' });

    const res = await request(app)
      .delete(`/api/tasks/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Vérifier que la tâche n'existe plus
    const check = await request(app)
      .get(`/api/tasks/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(check.status).toBe(404);
  });
});