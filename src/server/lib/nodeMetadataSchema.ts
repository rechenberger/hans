import { z } from 'zod'

export const nodeMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  systemMessage: z.string().optional(),
})

export type NodeMetadata = z.infer<typeof nodeMetadataSchema>
