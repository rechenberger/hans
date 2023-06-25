import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

const nodeMetadataSchema = z.object({
  titel: z.string(),
})

type NodeMetadata = z.infer<typeof nodeMetadataSchema>

export const nodeRouter = createTRPCRouter({
  start: publicProcedure.mutation(async ({ ctx }) => {
    const node = await ctx.prisma.node.create({
      data: {
        metadata: {
          titel: 'a simple stone',
        } satisfies NodeMetadata,
      },
    })

    return node.id
  }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const node = await ctx.prisma.node.findUniqueOrThrow({
        where: {
          id: input.id,
        },
      })

      return { ...node, metadata: nodeMetadataSchema.parse(node.metadata) }
    }),
})
