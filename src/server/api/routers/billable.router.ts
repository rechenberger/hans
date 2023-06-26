import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

export const billableRouter = createTRPCRouter({
  getBudget: publicProcedure.query(async ({ ctx }) => {
    const all = await ctx.prisma.billable.aggregate({
      _sum: {
        costsInTeamTokens: true,
      },
    })

    const OPENAI_CHAT_COMPLETION = await ctx.prisma.billable.aggregate({
      _sum: {
        costsInTeamTokens: true,
      },
      where: {
        billableType: 'OPENAI_CHAT_COMPLETION',
      },
    })

    const REPLICATE_IMAGE_GENERATION = await ctx.prisma.billable.aggregate({
      _sum: {
        costsInTeamTokens: true,
      },
      where: {
        billableType: 'REPLICATE_IMAGE_GENERATION',
      },
    })

    return {
      Total: all._sum,
      'Text Generation': OPENAI_CHAT_COMPLETION._sum,
      'Image Generation': REPLICATE_IMAGE_GENERATION._sum,
    }
  }),
})
