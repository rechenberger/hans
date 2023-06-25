import { first } from 'lodash-es'
import { supabase } from '../lib/supabase'
import { replicate } from './replicate'

export const generateImage = async ({
  prompt,
  id,
}: {
  prompt: string
  id: string
}) => {
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

  if (!url) {
    throw new Error('No image URL returned from Replicate')
  }

  const fetched = await fetch(url)
  const blob = await fetched.blob()

  const supabaseResponse = await supabase.storage
    .from('images')
    .upload(`${id}.png`, blob)

  if (supabaseResponse.error) {
    throw new Error(supabaseResponse.error.message)
  }

  const path = supabaseResponse.data.path
  console.log({ path })

  const publicUrlResponse = await supabase.storage
    .from('images')
    .getPublicUrl(path)
  const publicUrl = publicUrlResponse.data.publicUrl

  return publicUrl
}
