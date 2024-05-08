import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.enum(['true', 'false']),
      })

      const {
        name,
        description,
        is_on_diet: isOnDiet,
      } = createMealBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({ session_id: sessionId })
        .first()
        .select('id')

      if (!user) {
        return { error: 'User not found' }
      }

      await knex('meals').insert({
        id: randomUUID(),
        user_id: user.id,
        name,
        description,
        is_on_diet: isOnDiet,
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_on_diet: z.enum(['true', 'false']),
      })

      const {
        name,
        description,
        is_on_diet: isOnDiet,
      } = createMealBodySchema.parse(request.body)

      const meal = await knex('meals').where({ id }).first()

      if (!meal) {
        return { error: 'User not found' }
      }

      meal.name = name
      meal.description = description
      meal.is_on_diet = isOnDiet

      await knex('meals').where({ id }).first().update(meal)

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      await knex('meals').where({ id }).delete()

      return reply.status(201).send()
    },
  )
}
