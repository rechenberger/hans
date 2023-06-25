import Head from 'next/head'
import { useNode } from '~/client/useNode'
import { api } from '~/utils/api'

export default function Page() {
  const { node } = useNode()

  const title = node?.metadata.title

  const { mutate: generateChildren } = api.node.generateChildren.useMutation()

  return (
    <>
      <Head>
        <title>{title} | Hans</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <div className="rounded bg-white/20 p-2">
            <div className="font-bold">{title}</div>
            <button
              className=""
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
          <pre className="rounded bg-white/20 p-2 text-xs">
            {JSON.stringify(node, null, 2)}
          </pre>
        </div>
      </main>
    </>
  )
}
