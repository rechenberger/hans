import Link from 'next/link'
import { type RouterOutputs } from '~/utils/api'

type Node = RouterOutputs['node']['get']
export const NodeCard = ({
  node,
  isCurrent,
}: {
  node: Node
  isCurrent: boolean
}) => {
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
        <Link
          className="mt-2 rounded bg-black/20 px-2 py-1 text-sm"
          href={`/${node.id}`}
        >
          Trade
        </Link>
      )}
    </div>
  )
}
