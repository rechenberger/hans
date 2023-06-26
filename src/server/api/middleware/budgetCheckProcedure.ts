import { TRPCError } from '@trpc/server'
import { env } from '~/env.mjs'
import { sendDiscordMessage } from '~/server/lib/discord'
import { publicProcedure } from '../trpc'

let alreadySentDiscordMessage = false

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
      if (!alreadySentDiscordMessage) {
        alreadySentDiscordMessage = true
        try {
          await sendDiscordMessage({
            content: `Hans AI is over budget! Used ${usedTeamTokens?.toLocaleString()} of ${env.TEAMTOKEN_BUDGET?.toLocaleString()} team tokens.`,
          })
        } catch (error) {
          alreadySentDiscordMessage = false
          throw error
        }
      }

      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        // message: 'Team token budget exceeded',
      })
    }

    return next()
  }
)
