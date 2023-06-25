import { Configuration, OpenAIApi } from 'openai'
import { env } from '~/env.mjs'

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
})
export const openai = new OpenAIApi(configuration)

// const chatCompletion = await openai.createChatCompletion({
//   model: 'gpt-3.5-turbo',
//   messages: [{ role: 'user', content: 'Hello world' }],
// })
// console.log(chatCompletion.data.choices[0].message)
