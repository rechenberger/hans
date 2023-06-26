import { type Billable, type BillableType } from '@prisma/client'
import { env } from '~/env.mjs'
import { type OpenAIModel } from '../ai/openai'

export type BillableApiData =
  | {
      service: 'openai'
      model: OpenAIModel
      prompt_tokens: number
      completion_tokens: number
      total_tokens: number
    }
  // | {
  //     service: 'openai' | 'azure'
  //     model: 'whisper' | 'speechToText'
  //     speechToTextAudioDuration: number
  //     numberOfCharacters: number
  //   }
  // | {
  //     service: 'openai' | 'elevenLabs' | 'azure'
  //     model: 'textToSpeech'
  //     speechToTextAudioDuration: number
  //     numberOfCharacters: number
  //   }
  | {
      service: 'replicate'
      model: 'imageGeneration' | 'imageUpscaling'
      timeToCompleteInSeconds: number
    }

// const ONE_HOUR_IN_SECONDS = 3600

export const calcUpstreamCostsInCents = (billableApiData: BillableApiData) => {
  if (billableApiData.service === 'openai') {
    // FROM: https://openai.com/pricing
    if (billableApiData.model === 'gpt-4-0613') {
      const prompt = (billableApiData.prompt_tokens / 1000) * 3
      const completion = (billableApiData.completion_tokens / 1000) * 6
      const costsInCents = prompt + completion

      return costsInCents
    }
    // if (billableApiData.model === 'gpt-4-32k') {
    //   const prompt = (billableApiData.prompt_tokens / 1000) * 6
    //   const completion = (billableApiData.completion_tokens / 1000) * 12
    //   const costsInCents = prompt + completion

    //   return costsInCents
    // }
    if (billableApiData.model === 'gpt-3.5-turbo-0613') {
      const prompt = (billableApiData.prompt_tokens / 1000) * 0.15
      const completion = (billableApiData.completion_tokens / 1000) * 0.2
      const costsInCents = prompt + completion
      return costsInCents
    }
    if (billableApiData.model === 'gpt-3.5-turbo-16k') {
      const prompt = (billableApiData.prompt_tokens / 1000) * 0.3
      const completion = (billableApiData.completion_tokens / 1000) * 0.4
      const costsInCents = prompt + completion
      return costsInCents
    }

    // if (billableApiData.model === 'whisper') {
    //   const costsInCents =
    //     (billableApiData.speechToTextAudioDuration / ONE_HOUR_IN_SECONDS) * 36
    //   return costsInCents
    // }
    throw new Error(`Unknown openai model ${billableApiData.model}`)
  }

  // if (billableApiData.service === 'elevenLabs') {
  //   if (billableApiData.model === 'textToSpeech') {
  //     const costsInCents = (billableApiData.numberOfCharacters / 1000) * 30
  //     return costsInCents
  //   }
  // }
  // if (billableApiData.service === 'azure') {
  //   if (billableApiData.model === 'textToSpeech') {
  //     //https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/
  //     const costsInCents =
  //       (billableApiData.numberOfCharacters / 1_000_000) * 1600
  //     return costsInCents
  //   }

  //   if (billableApiData.model === 'speechToText') {
  //     //https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/
  //     const costsInCents =
  //       (billableApiData.speechToTextAudioDuration / ONE_HOUR_IN_SECONDS) * 100
  //     return costsInCents
  //   }
  //   throw new Error(`Unknown azure model ${billableApiData.model}`)
  // }

  if (billableApiData.service === 'replicate') {
    if (billableApiData.model === 'imageGeneration') {
      const costsInCents = billableApiData.timeToCompleteInSeconds * 0.23 // $0.0023 per second - NvidiA A100 40GB https://replicate.com/ai-forever/kandinsky-2#performance
      return costsInCents
    }
    if (billableApiData.model === 'imageUpscaling') {
      const costsInCents = billableApiData.timeToCompleteInSeconds * 0.055 // $0.00055 per second - NvidiA T4 16GB // https://replicate.com/nightmareai/real-esrgan#performance
      return costsInCents
    }
    throw new Error(`Unknown replicate model ${billableApiData.model}`)
  }

  // @ts-expect-error billableApiData is `never` because of the exhaustive check above
  throw new Error(`Unknown service ${billableApiData.service}`)
}

export const calcCostsInTeamTokens = ({
  upstreamCostsInCents,
}: {
  upstreamCostsInCents: number
}) => {
  const costsInTeamTokens = Math.ceil(
    upstreamCostsInCents * env.DEFAULT_TEAMTOKEN_PER_UPSTREAM_CENT
  )
  return costsInTeamTokens
}

export const calcBillable = ({
  billableApiData,
}: {
  billableApiData: BillableApiData
}) => {
  const upstreamCostsInCents = calcUpstreamCostsInCents(billableApiData)
  const costsInTeamTokens = calcCostsInTeamTokens({
    upstreamCostsInCents,
  })
  let billableType: BillableType
  if (billableApiData.service === 'openai') {
    billableType = 'OPENAI_CHAT_COMPLETION'
  } else if (billableApiData.service === 'replicate') {
    billableType = 'REPLICATE_IMAGE_GENERATION'
  } else {
    // @ts-expect-error billableApiData is `never` because of the exhaustive check above
    throw new Error(`Unknown service ${billableApiData.service}}`)
  }

  return {
    upstreamCostsInCents,
    costsInTeamTokens,
    billableType,
    apiData: billableApiData,
  } satisfies Omit<Billable, 'id' | 'updatedAt' | 'createdAt' | 'nodeId'>
}
