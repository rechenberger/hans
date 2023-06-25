import { z } from 'zod'

export const nodeMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
})

export type NodeMetadata = z.infer<typeof nodeMetadataSchema>
