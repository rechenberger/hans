import { type PrismaClient } from '@prisma/client'
import { first } from 'lodash-es'
import { z } from 'zod'
import { openai } from '../ai/openai'
import { getNode } from './getNode'
import { nodeMetadataSchema } from './nodeMetadataSchema'

export const generateChildren = async ({
  prisma,
  id,
}: {
  prisma: PrismaClient
  id: string
}) => {
  const node = await getNode({ prisma, id })

  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-0613',
      // model: 'gpt-4-0613',
      messages: [
        {
          role: 'system',
          content: `The user is playing a video game. The player sends you the item they have in their inventory. You will give the player 3 choices of what to trade the item for. It should be a reasonable trade with roughly equal value. Use the GenerateItem function.`,
        },
        {
          role: 'user',
          content: JSON.stringify(node.metadata),
        },
      ],
      temperature: 1,
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

    const { items } = schema.parse(JSON.parse(message.function_call.arguments))

    console.log({ items })

    await prisma.node.createMany({
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
}
