import { TRPCError } from '@trpc/server'
import { flatMap, map } from 'lodash-es'
import { z } from 'zod'
import { DEFAULT_START_NODE, DEPRECATION_DATE } from '~/config'
import { env } from '~/env.mjs'
import { generateImage } from '~/server/ai/generateImage'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { generateChildren } from '~/server/lib/generateChildren'
import { getNode } from '~/server/lib/getNode'
import {
  nodeMetadataSchema,
  type NodeMetadata,
} from '~/server/lib/nodeMetadataSchema'
import { budgetCheckProcedure } from '../middleware/budgetCheckProcedure'

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
    const communityRaw = await ctx.prisma.node.findMany({
      where: {
        parentId: null,
        featured: false,
        createdAt: {
          gte: DEPRECATION_DATE,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 12,
    })
    const community = flatMap(communityRaw, (start) => {
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

    const featuredRaw = await ctx.prisma.node.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    })

    const featured = flatMap(featuredRaw, (start) => {
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

    return { community, featured }
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
          createdAt: 'asc',
        },
      })
      const children = map(childrenRaw, (child) => ({
        ...child,
        metadata: nodeMetadataSchema.parse(child.metadata),
      }))
      return children
    }),

  generateChildren: budgetCheckProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await generateChildren({ prisma: ctx.prisma, id: input.id })
    }),

  ensureChildren: budgetCheckProcedure
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

  getImageUrl: budgetCheckProcedure
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
      const { imageUrl, billable } = await generateImage({
        prompt: imageDescription,
        nodeId: node.id,
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
          billables: {
            create: billable,
          },
        },
      })
      return imageUrl
    }),

  setFeatured: publicProcedure
    .input(
      z.object({
        id: z.string(),
        featured: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!env.NEXT_PUBLIC_DEV_MODE) {
        throw new TRPCError({
          code: 'FORBIDDEN',
        })
      }
      await ctx.prisma.node.update({
        where: {
          id: input.id,
        },
        data: {
          featured: input.featured,
        },
      })
    }),
})
