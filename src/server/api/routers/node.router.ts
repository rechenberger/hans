import { flatMap, map } from 'lodash-es'
import { z } from 'zod'
import { DEFAULT_START_NODE } from '~/config'
import { generateImage } from '~/server/ai/generateImage'
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
          metadata: input ?? (DEFAULT_START_NODE satisfies NodeMetadata),
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

  getStarters: publicProcedure.query(async ({ ctx }) => {
    const startsRaw = await ctx.prisma.node.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    })
    const starters = flatMap(startsRaw, (start) => {
      const parsed = nodeMetadataSchema.safeParse(start.metadata)
      if (!parsed.success) {
        return []
      }
      const node = {
        ...start,
        metadata: parsed.data,
      }
      return [node]
    })
    return starters
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
        orderBy: {
          createdAt: 'desc',
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

  getImageUrl: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const node = await getNode({ prisma: ctx.prisma, id: input.id })
      if (node.metadata.imageUrl) {
        return node.metadata.imageUrl
      }
      const imageDescription =
        node.metadata.imageDescription || node.metadata.description
      if (!imageDescription) {
        return null
      }
      const imageUrl = await generateImage({
        prompt: imageDescription,
      })
      await ctx.prisma.node.update({
        where: {
          id: node.id,
        },
        data: {
          metadata: {
            ...node.metadata,
            imageUrl,
          } satisfies NodeMetadata,
        },
      })
      return imageUrl
    }),
})
