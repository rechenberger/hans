import { first, map } from 'lodash-es'
import { z } from 'zod'
import { openai } from '~/server/ai/openai'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { getNode } from '~/server/lib/getNode'
import {
  nodeMetadataSchema,
  type NodeMetadata,
} from '~/server/lib/nodeMetadataSchema'

export const nodeRouter = createTRPCRouter({
  start: publicProcedure.mutation(async ({ ctx }) => {
    const node = await ctx.prisma.node.create({
      data: {
        metadata: {
          title: 'a simple stone',
          description: 'a simple gray stone found on the side of the road',
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
      const node = await getNode({ prisma: ctx.prisma, id: input.id })

      try {
        const response = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo-0613',
          messages: [
            {
              role: 'system',
              content: `The user is playing a video game. The player sends you the item they have in their inventory. You will give the player 3 choices of what to trade the item for. It should be a reasonable trade. Use the GenerateItem function.`,
            },
            {
              role: 'user',
              content: JSON.stringify(node.metadata),
            },
          ],
          function_call: 'auto',
          functions: [
            {
              name: 'GenerateItem',
              description: 'Generate an item',
              parameters: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'string',
                          description: 'The title of the item',
                        },
                        description: {
                          type: 'string',
                          description: 'A very short description of the item',
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        })
        const message = first(response.data.choices)?.message
        if (!message) {
          throw new Error('No message returned from OpenAI')
        }

        // console.log({ message })

        const schema = z.object({
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
            })
          ),
        })

        if (!message.function_call) {
          throw new Error('No function call returned from OpenAI')
        }

        if (message.function_call.name !== 'GenerateItem') {
          throw new Error(
            `Unexpected function call name: ${
              message.function_call.name || 'undefined'
            }`
          )
        }

        if (!message.function_call.arguments) {
          throw new Error('No function call arguments returned from OpenAI')
        }

        const { items } = schema.parse(
          JSON.parse(message.function_call.arguments)
        )

        console.log({ items })

        await ctx.prisma.node.createMany({
          data: items.map((item) => ({
            metadata: nodeMetadataSchema.parse(item),
            parentId: node.id,
          })),
        })
      } catch (error: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const openAIError = error?.response?.data?.error
        if (openAIError) {
          console.error(openAIError)
        }
        throw error
      }
    }),
})
