import { first } from 'lodash-es'
import { calcBillable } from '../lib/BillableApiData'
import { supabase } from '../lib/supabase'
import { replicate } from './replicate'

export const generateImage = async ({
  prompt,
  nodeId,
}: {
  prompt: string
  nodeId: string
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
  const replicateUrl = first(generateImageResponse as string[])

  if (!replicateUrl) {
    throw new Error('No image URL returned from Replicate')
  }

  const fetched = await fetch(replicateUrl)
  const buffer = await fetched.arrayBuffer()

  const supabaseResponse = await supabase.storage
    .from('images')
    .upload(`${nodeId}.png`, buffer, { contentType: 'image/png', upsert: true })

  if (supabaseResponse.error) {
    throw new Error(supabaseResponse.error.message)
  }

  const path = supabaseResponse.data.path
  console.log({ path })

  const publicUrlResponse = await supabase.storage
    .from('images')
    .getPublicUrl(path)
  const publicUrl = publicUrlResponse.data.publicUrl

  // BILLABLE
  const res = await replicate.predictions.list()
  const filteredElement = res.results.find(
    (element) => element.output && element.output.includes(replicateUrl)
  )
  let timeToCompleteInSeconds = 0
  if (!!filteredElement) {
    const { metrics } = filteredElement
    timeToCompleteInSeconds = metrics?.predict_time || 0
  }
  const billable = calcBillable({
    billableApiData: {
      service: 'replicate',
      model: 'imageGeneration',
      timeToCompleteInSeconds,
    },
  })

  return { imageUrl: publicUrl, billable }
}
