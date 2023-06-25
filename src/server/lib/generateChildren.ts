import { type PrismaClient } from '@prisma/client'
import { first, map, pick } from 'lodash-es'
import { z } from 'zod'
import { DEFAULT_SYSTEM_MESSAGE, GENERATE_IMAGES_ASAP } from '~/config'
import { generateImage } from '../ai/generateImage'
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
          content: node.metadata.systemMessage || DEFAULT_SYSTEM_MESSAGE,
        },
        {
          role: 'user',
          content: JSON.stringify(
            pick(node.metadata, [
              'title',
              'description',
              'imageDescription',
              'descriptionConsequences',
            ])
          ),
        },
      ],
      temperature: 1,
      function_call: 'auto',
      functions: [
        {
          name: 'GenerateOptions',
          description: 'Generate a the players next options',
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
                      description: 'The title of the next option',
                    },
                    description: {
                      type: 'string',
                      description: 'A short description of the next option',
                    },
                    imageDescription: {
                      type: 'string',
                      description:
                        'Short image description of the next option. like "a cat sitting on a table"',
                    },
                    descriptionConsequences: {
                      type: 'string',
                      description:
                        'What happens if the player chooses this option? Continue the story.',
                    },
                  },
                  required: ['title', 'description', 'descriptionConsequences'],
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
      items: z.array(nodeMetadataSchema),
    })

    if (!message.function_call) {
      throw new Error('No function call returned from OpenAI')
    }

    if (message.function_call.name !== 'GenerateOptions') {
      throw new Error(
        `Unexpected function call name: ${
          message.function_call.name || 'undefined'
        }`
      )
    }

    if (!message.function_call.arguments) {
      throw new Error('No function call arguments returned from OpenAI')
    }

    const { items: options } = schema.parse(
      JSON.parse(message.function_call.arguments)
    )
    console.log(options)

    const optionsWithImages = await Promise.all(
      map(options, async (option) => {
        if (!GENERATE_IMAGES_ASAP || !option.imageDescription) return option
        const url = await generateImage({
          prompt: option.imageDescription,
        })
        return {
          ...option,
          imageUrl: url,
        }
      })
    )

    await prisma.node.createMany({
      data: optionsWithImages.map((option) => ({
        metadata: {
          ...nodeMetadataSchema.parse(option),
          systemMessage: node.metadata.systemMessage,
        },
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
