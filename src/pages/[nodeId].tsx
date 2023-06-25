import Head from 'next/head'
import Link from 'next/link'
import { useNode } from '~/client/useNode'
import { api } from '~/utils/api'

export default function Page() {
  const { node } = useNode()

  const title = node?.metadata.title

  const trpc = api.useContext()

  const { mutate: generateChildren } = api.node.generateChildren.useMutation({
    onSuccess: () => {
      trpc.node.invalidate()
    },
  })

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="flex flex-col gap-2 rounded bg-white/20 p-2">
            <div className="font-bold">{title}</div>
            <div className="text-xs italic opacity-80">
              {node?.metadata.description}
            </div>
            <button
              className="rounded bg-black/20 px-2 py-1 text-sm"
              onClick={() => {
                if (!node) return
                generateChildren({
                  id: node.id,
                })
              }}
            >
              Generate Children
            </button>
          </div>
          <hr className="w-full border-t-black/20" />
          <div className="grid grid-cols-3 gap-2">
            {children?.map((child) => (
              <div
                key={child.id}
                className="flex flex-col gap-2 rounded bg-white/20 p-2"
              >
                <div className="font-bold">{child?.metadata.title}</div>
                <div className="text-xs italic opacity-80">
                  {child?.metadata.description}
                </div>
                <div className="flex-1" />
                <Link
                  className="rounded bg-black/20 px-2 py-1 text-sm"
                  href={`/${child.id}`}
                >
                  Trade
                </Link>
              </div>
            ))}
          </div>
          {/* <pre className="rounded bg-white/20 p-2 text-xs">
            {JSON.stringify(node, null, 2)}
          </pre> */}
        </div>
      </main>
    </>
  )
}
