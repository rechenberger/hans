import { z } from 'zod'

export const nodeMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  descriptionConsequences: z.string().optional(),
  imageDescription: z.string().optional(),
  imageUrl: z.string().optional(),
  systemMessage: z.string().optional(),
})

export type NodeMetadata = z.infer<typeof nodeMetadataSchema>
