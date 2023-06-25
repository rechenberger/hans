import { map } from 'lodash-es'
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { generateChildren } from '~/server/lib/generateChildren'
import { getNode } from '~/server/lib/getNode'
import {
  nodeMetadataSchema,
  type NodeMetadata,
} from '~/server/lib/nodeMetadataSchema'

export const nodeRouter = createTRPCRouter({
  start: publicProcedure
    .input(nodeMetadataSchema.optional())
    .mutation(async ({ ctx, input }) => {
      const node = await ctx.prisma.node.create({
        data: {
          metadata:
            input ??
            ({
              title: 'a simple stone',
              description: 'a simple gray stone found on the side of the road',
            } satisfies NodeMetadata),
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
      const node = await getNode({ prisma: ctx.prisma, id: input.id })
      return node
    }),

  getChildren: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const childrenRaw = await ctx.prisma.node.findMany({
        where: {
          parentId: input.id,
        },
      })
      const children = map(childrenRaw, (child) => ({
        ...child,
        metadata: nodeMetadataSchema.parse(child.metadata),
      }))
      return children
    }),

  generateChildren: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await generateChildren({ prisma: ctx.prisma, id: input.id })
    }),

  ensureChildren: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const children = await ctx.prisma.node.count({
        where: {
          parentId: input.id,
        },
      })

      if (!children) {
        await generateChildren({ prisma: ctx.prisma, id: input.id })
      }

      return true
    }),
})
