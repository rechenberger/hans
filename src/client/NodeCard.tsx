import { Edit, Loader2 } from 'lucide-react'
import Image from 'next/image'
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
    <div className="group flex flex-col rounded bg-white/20 p-2">
      {isCurrent && <div className="text-xs opacity-80">Current</div>}
      <div className="flex flex-row items-start gap-2">
        <div className="flex-1 truncate font-bold" title={node?.metadata.title}>
          {node?.metadata.title}
        </div>
        <div className="mt-1 flex shrink-0 flex-row gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
          {!!error && (
            <div className="text-xs text-red-500" title={error.message}>
              X
            </div>
          )}
          <Link className="text-xs" href={`/custom?templateId=${node.id}`}>
            <Edit className="h-4 w-4 opacity-50 hover:opacity-100" />
          </Link>
        </div>
      </div>
      {!!node?.metadata.imageUrl && (
        <div className="-mx-2 my-2">
          <Image
            src={node.metadata.imageUrl}
            className="w-full"
            alt={node.metadata.imageDescription || node.metadata.description}
            title={node.metadata.imageDescription || node.metadata.description}
            width={256}
            height={256}
            unoptimized
          />
        </div>
      )}
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
            Pick
          </Link>
        </div>
      )}
    </div>
  )
}
