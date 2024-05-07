import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      return console.log('ok')
    },
  )
  app.post('/', async (request) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.enum(['true', 'false']),
    })

    const { name, description, is_on_diet } = createMealBodySchema.parse(
      request.body,
    )
    const { sessionId } = request.cookies

    const { id: userId } = await knex('users')
      .where({ session_id: sessionId })
      .first()
      .select('id')

    await knex('meals').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      is_on_diet,
    })
  })
}
