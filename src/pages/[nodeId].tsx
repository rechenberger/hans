import Head from 'next/head'
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
      <Head>
        <title>{title} | Hans</title>
        <link rel="icon" href="/hanns.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {!!node && <NodeCard node={node} isCurrent={true} />}
          <hr className="w-full border-t-black/20" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {children?.map((child) => (
              <NodeCard key={child.id} node={child} isCurrent={false} />
            ))}
          </div>
          {/* <pre className="rounded bg-white/20 p-2 text-xs">
            {JSON.stringify(node, null, 2)}
          </pre> */}
          {/* <button
            className="rounded bg-black/20 px-2 py-1 text-sm"
            onClick={() => {
              if (!node) return
              generateChildren({
                id: node.id,
              })
            }}
          >
            Generate Children
          </button> */}
        </div>
      </main>
    </>
  )
}
