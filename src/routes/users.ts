import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const tables = await knex('sqlite_schema').select('*')

    return tables
  })
}
