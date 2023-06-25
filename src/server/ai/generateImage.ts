import { first } from 'lodash-es'
import { replicate } from './replicate'

export const generateImage = async ({ prompt }: { prompt: string }) => {
  const modelVersion =
    'ai-forever/kandinsky-2:601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f'
  const generateImageResponse = await replicate.run(modelVersion, {
    input: {
      prompt,
      height: 256,
      width: 256,
    },
  })
  const url = first(generateImageResponse as string[])

  return url
}
