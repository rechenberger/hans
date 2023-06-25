import Head from 'next/head'
import { useNode } from '~/client/useNode'

export default function Page() {
  const { node } = useNode()

  const title = node?.metadata.title

  return (
    <>
      <Head>
        <title>{title} | Hans</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            {title}
          </h1>
          <pre className="rounded bg-white/20 p-2 text-xs">
            {JSON.stringify(node, null, 2)}
          </pre>
        </div>
      </main>
    </>
  )
}
