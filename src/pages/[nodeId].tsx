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

  return (
    <>
      <MainLayout title={title}>
        {!!node && <NodeCard node={node} isCurrent={true} />}
        <hr className="w-full border-t-black/20" />
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {children?.map((child) => (
            <NodeCard key={child.id} node={child} isCurrent={false} />
          ))}
        </div>
      </MainLayout>
    </>
  )
}
