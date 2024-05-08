import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function metricsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({ session_id: sessionId })
        .first()
        .select('id')

      if (!user) {
        return { error: 'User not found' }
      }

      const { id: userId } = user

      const totalMeals = await knex('meals')
        .where({ user_id: userId })
        .orderBy('created_at')

      const mealsOnDiet = await knex('meals')
        .where({ user_id: userId })
        .where({ is_on_diet: 'true' })

      return {
        'Total meals': totalMeals.length,
        'Meals on diet': mealsOnDiet.length,
        'Meals of diet': totalMeals.length - mealsOnDiet.length,
      }
    },
  )
}
