import { Configuration, OpenAIApi } from 'openai'
import { z } from 'zod'
import { env } from '~/env.mjs'

export const openAIModels = [
  'gpt-4-0613',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k',
] as const
export const openAIModelEnum = z.enum(openAIModels)

export type OpenAIModel = z.infer<typeof openAIModelEnum>

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})
export const openai = new OpenAIApi(configuration)

// const chatCompletion = await openai.createChatCompletion({
//   model: 'gpt-3.5-turbo',
//   messages: [{ role: 'user', content: 'Hello world' }],
// })
// console.log(chatCompletion.data.choices[0].message)
