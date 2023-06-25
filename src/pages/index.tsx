import Head from 'next/head'
import { useRouter } from 'next/router'
import { api } from '~/utils/api'

export default function Page() {
  const router = useRouter()

  const { mutate: start } = api.node.start.useMutation({
    onSuccess: async (data) => {
      await router.push(`/${data}`)
    },
  })

  return (
    <>
      <Head>
        <title>Hans</title>
        <link rel="icon" href="/hanns.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Hans
          </h1>
          <button
            onClick={() => start()}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          >
            <h3 className="text-2xl font-bold">Start →</h3>
          </button>
        </div>
      </main>
    </>
  )
}
