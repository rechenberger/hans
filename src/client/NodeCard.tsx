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
  const { isLoading, error } = api.node.ensureChildren.useQuery({
    id: node.id,
  })

  return (
    <div className="flex flex-col rounded bg-white/20 p-2">
      {isCurrent && (
        <div className="text-xs opacity-80">Your current items</div>
      )}
      <div className="font-bold">{node?.metadata.title}</div>
      <div className="text-xs italic opacity-80">
        {node?.metadata.description}
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
          <div className="flex-1 " />
          {isLoading && <div className="text-xs">...</div>}
          {!!error && <div className="text-xs">X</div>}
        </div>
      )}
    </div>
  )
}
