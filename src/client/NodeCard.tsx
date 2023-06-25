import { ArrowRight, Edit, Loader2, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { env } from '~/env.mjs'
import { api, type RouterOutputs } from '~/utils/api'

type Node = RouterOutputs['node']['get']
export const NodeCard = ({
  node,
  isCurrent,
  tiny,
  top,
  showCustomize,
}: {
  node: Node
  isCurrent: boolean
  tiny?: boolean
  top?: ReactNode
  showCustomize?: boolean
}) => {
  const trpc = api.useContext()
  const { isLoading, error } = api.node.ensureChildren.useQuery(
    {
      id: node.id,
    },
    {
      staleTime: Infinity,
      onSuccess: () => {
        trpc.node.getChildren.invalidate()
      },
    }
  )

  const shouldHaveImage =
    !!node.metadata.imageDescription || !!node.metadata.description

  const { data: imageUrlLazy } = api.node.getImageUrl.useQuery(
    {
      id: node.id,
    },
    {
      enabled: shouldHaveImage && !node.metadata.imageUrl,
      staleTime: Infinity,
      onSuccess: () => {
        trpc.node.getChildren.invalidate()
      },
    }
  )

  const imageUrl = node.metadata.imageUrl || imageUrlLazy

  const { mutate: setFeatured } = api.node.setFeatured.useMutation({
    onSuccess: () => {
      trpc.node.getChildren.invalidate()
      trpc.node.getStarters.invalidate()
      trpc.node.get.invalidate()
    },
  })

  const showSetFeatured = env.NEXT_PUBLIC_DEV_MODE

  return (
    <div className="group flex flex-col rounded bg-white/20 p-2">
      {top}
      {isCurrent && <div className="text-xs opacity-80">Current</div>}
      <div className="flex flex-row items-start gap-2">
        <div className="flex-1 truncate font-bold" title={node?.metadata.title}>
          {node?.metadata.title}
        </div>
        <div className="my-1 flex shrink-0 flex-row gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
          {!!error && (
            <div className="text-xs text-red-500" title={error.message}>
              X
            </div>
          )}
          {showSetFeatured && (
            <button
              onClick={() =>
                setFeatured({
                  id: node.id,
                  featured: !node.featured,
                })
              }
            >
              {node.featured ? (
                <Star className="h-4 w-4 text-amber-400" />
              ) : (
                <Star className="h-4 w-4" />
              )}
            </button>
          )}
          {showCustomize && (
            <Link
              className="-my-1 flex flex-row gap-0.5 rounded px-2 py-1 text-xs opacity-50  hover:bg-white/20 hover:opacity-100"
              href={`/custom?templateId=${node.id}`}
            >
              <Edit className="h-4 w-4" />
              <div>Customize</div>
            </Link>
          )}
        </div>
      </div>
      {!tiny && shouldHaveImage && (
        <div className="-mx-2 my-2 aspect-square">
          {!!imageUrl ? (
            <Link href={isCurrent ? '#' : `/${node.id}`}>
              <Image
                src={imageUrl}
                className="w-full"
                alt={
                  node.metadata.imageDescription || node.metadata.description
                }
                title={
                  node.metadata.imageDescription || node.metadata.description
                }
                width={256}
                height={256}
                unoptimized
              />
            </Link>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/20">
              <Loader2 className="h-4 w-4 animate-spin opacity-50" />
            </div>
          )}
        </div>
      )}
      {!tiny && (
        <div className="text-xs italic opacity-80">
          {node?.metadata.description}
        </div>
      )}
      {!tiny && isCurrent && node?.metadata.descriptionConsequences && (
        <div className="mt-4 flex flex-row gap-1 text-xs italic opacity-80">
          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
          <div>{node?.metadata.descriptionConsequences}</div>
        </div>
      )}
      <div className="flex-1" />
      {!tiny && !isCurrent && (
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
