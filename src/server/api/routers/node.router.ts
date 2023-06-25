import { type PrismaClient } from '@prisma/client'
import { first } from 'lodash-es'
import { z } from 'zod'
import { openai } from '~/server/ai/openai'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

const nodeMetadataSchema = z.object({
  title: z.string(),
})

type NodeMetadata = z.infer<typeof nodeMetadataSchema>

export const nodeRouter = createTRPCRouter({
  start: publicProcedure.mutation(async ({ ctx }) => {
    const node = await ctx.prisma.node.create({
      data: {
        metadata: {
          title: 'a simple stone',
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
              content: `The user is playing a video game. The player has a single item in their inventory: "${node.metadata.title}". You will give the player 3 choices of what to trade the item for. It should be a reasonable trade. Use the GenerateItem function.`,
            },
            // {
            //   role: 'user',
            //   content: `${node.metadata.title}`,
            // },
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
                      type: 'string',
                    },
                  },
                },
              },
            },
          ],
        })
        const message = first(response.data.choices)?.message

        console.log({ message })
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

const getNode = async ({
  prisma,
  id,
}: {
  prisma: PrismaClient
  id: string
}) => {
  const node = await prisma.node.findUniqueOrThrow({
    where: {
      id,
    },
  })

  return { ...node, metadata: nodeMetadataSchema.parse(node.metadata) }
}
