import Replicate from 'replicate'
import { env } from '~/env.mjs'

export const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
})
