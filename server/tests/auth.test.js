import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'
import { connectTestDB, disconnectTestDB, clearTestDB } from './testDb.js'

beforeAll(connectTestDB)
afterAll(disconnectTestDB)
afterEach(clearTestDB)

describe('auth flow', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'angler@example.com', password: 'salmon123' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
  })

  it('logs in an existing user and returns a token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'angler@example.com', password: 'salmon123' })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'angler@example.com', password: 'salmon123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('allows a logged-in user to access a protected route', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'angler@example.com', password: 'salmon123' })

    const token = registerRes.body.token

    const res = await request(app)
      .get('/api/catches')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('rejects a protected route with no token', async () => {
    const res = await request(app).get('/api/catches')

    expect(res.status).toBe(401)
  })
})