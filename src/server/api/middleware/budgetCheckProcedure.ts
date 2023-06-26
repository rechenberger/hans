import { TRPCError } from '@trpc/server'
import { env } from '~/env.mjs'
import { publicProcedure } from '../trpc'

export const budgetCheckProcedure = publicProcedure.use(
  async ({ ctx, next }) => {
    const data = await ctx.prisma.billable.aggregate({
      _sum: {
        costsInTeamTokens: true,
      },
    })

    const usedTeamTokens = data._sum.costsInTeamTokens || 0
    const overBudget = usedTeamTokens > env.TEAMTOKEN_BUDGET

    if (overBudget) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        // message: 'Team token budget exceeded',
      })
    }

    return next()
  }
)
