import { it, beforeAll, afterAll, beforeEach, describe, expect } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  it('should be able to create meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Usuário teste',
        email: 'usuario@test.com',
        password: '123',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie') ?? []

    const listUsers = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsers.body.users[0].id

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        user_id: userId,
        name: 'Refeição teste',
        description: 'descrição',
        is_on_diet: 'true',
      })
      .expect(201)
  })
})
