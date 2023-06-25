import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api, type RouterOutputs } from '~/utils/api'

type Node = RouterOutputs['node']['get']
export const NodeCard = ({
  node,
  isCurrent,
}: {
  node: Node
  isCurrent: boolean
}) => {
  const trpc = api.useContext()
  const { isLoading, error } = api.node.ensureChildren.useQuery(
    {
      id: node.id,
    },
    {
      onSuccess: () => {
        trpc.node.getChildren.invalidate()
      },
    }
  )

  return (
    <div className="flex flex-col rounded bg-white/20 p-2">
      {isCurrent && <div className="text-xs opacity-80">Your current item</div>}
      <div className="flex flex-row items-center gap-2">
        <div className="flex-1 font-bold">{node?.metadata.title}</div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
        {!!error && (
          <div className="text-xs text-red-500" title={error.message}>
            X
          </div>
        )}
      </div>
      <div className="text-xs italic opacity-80">
        {node?.metadata.description}
      </div>
      <div className="text-xs italic opacity-80">
        {node?.metadata.imageDescription}
      </div>
      <div className="flex-1" />
      {!isCurrent && (
        <div className="mt-2 flex flex-row items-center gap-2">
          <Link
            className="rounded bg-black/20 px-2 py-1 text-sm"
            href={`/${node.id}`}
          >
            Trade
          </Link>
        </div>
      )}
    </div>
  )
}
