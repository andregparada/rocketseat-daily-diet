import { it, beforeAll, afterAll, beforeEach, describe, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'Usuário teste',
        email: 'usuario@test.com',
        password: '123',
      })
      .expect(201)
  })

  it('should be able to list all users', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Usuário teste',
      email: 'usuario@test.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    expect(listUsersResponse.body.users).toEqual([
      expect.objectContaining({
        name: 'Usuário teste',
        email: 'usuario@test.com',
      }),
    ])
  })
})
