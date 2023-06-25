import { type PrismaClient } from '@prisma/client'
import { nodeMetadataSchema } from './nodeMetadataSchema'

export const getNode = async ({
  prisma,
  id,
}: {
  prisma: PrismaClient
  id: string
}) => {
  const node = await prisma.node.findUniqueOrThrow({
    where: {
      id,
    },
  })

  return { ...node, metadata: nodeMetadataSchema.parse(node.metadata) }
}
