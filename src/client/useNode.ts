import { useRouter } from 'next/router'
import { api } from '~/utils/api'

export const useNode = () => {
  const nodeId = useRouter().query.nodeId

  const { data: node } = api.node.get.useQuery(
    {
      id: nodeId as string,
    },
    {
      enabled: !!nodeId,
    }
  )

  return { node }
}
