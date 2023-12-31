import { orderBy } from 'lodash-es'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MainLayout } from '~/client/MainLayout'
import { NodeCard } from '~/client/NodeCard'
import { useNode } from '~/client/useNode'
import { api } from '~/utils/api'

export default function Page() {
  const { node } = useNode()

  const title = node?.metadata.title

  // const trpc = api.useContext()
  // const { mutate: generateChildren } = api.node.generateChildren.useMutation({
  //   onSuccess: () => {
  //     trpc.node.getChildren.invalidate()
  //   },
  // })

  const { data: children } = api.node.getChildren.useQuery(
    {
      id: node?.id!,
    },
    {
      enabled: !!node,
    }
  )

  const { data: parent } = api.node.get.useQuery(
    {
      id: node?.parentId!,
    },
    {
      enabled: !!node?.parentId,
    }
  )

  return (
    <>
      <MainLayout title={title}>
        <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-2 gap-y-4 md:grid-cols-3">
          {parent && (
            <>
              <div className="hidden md:flex" />
              <NodeCard
                node={parent}
                isCurrent={false}
                tiny
                top={
                  <Link href={`/${parent.id}`} className="flex flex-row gap-1">
                    <ArrowLeft className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    <div className="text-xs">Go Back</div>
                  </Link>
                }
              />
              <div className="hidden md:flex" />
            </>
          )}
          {!!node && (
            <>
              <div className="hidden md:flex" />
              <NodeCard node={node} isCurrent={true} showCustomize />
              <div className="hidden md:flex" />
            </>
          )}
        </div>
        {/* <hr className="w-full border-t-black/20" /> */}
        <div className="grid w-full max-w-5xl grid-cols-2 gap-2 md:grid-cols-3">
          {orderBy(children, (child) => child.createdAt, 'asc')?.map(
            (child, idx) => (
              <NodeCard
                key={child.id}
                node={child}
                isCurrent={false}
                top={<div className="text-xs">Option #{idx + 1}</div>}
              />
            )
          )}
        </div>
      </MainLayout>
    </>
  )
}
