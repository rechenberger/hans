import { useRouter } from 'next/router'
import { MainLayout } from '~/client/MainLayout'
import { NodeCard } from '~/client/NodeCard'
import { api } from '~/utils/api'

export default function Page() {
  const router = useRouter()

  const { mutate: start } = api.node.start.useMutation({
    onSuccess: async (data) => {
      await router.push(`/${data}`)
    },
  })

  const { data: starters } = api.node.getStarters.useQuery()

  return (
    <>
      <MainLayout>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Hans AI
        </h1>
        {/* <div className="flex flex-row gap-4">
          <button
            onClick={() => start()}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          >
            <h3 className="text-2xl font-bold">Start →</h3>
          </button>
          <Link
            href={'/custom'}
            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          >
            <h3 className="text-2xl font-bold">Custom →</h3>
          </Link>
        </div> */}
        <div className="text-xl text-white">Featured</div>
        <div className="grid w-full max-w-5xl grid-cols-2 gap-2 md:grid-cols-3">
          {starters?.featured.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isCurrent={false}
              showCustomize
            />
          ))}
        </div>
        <div className="text-xl text-white">Community</div>
        <div className="grid w-full max-w-5xl grid-cols-2 gap-2 md:grid-cols-3">
          {starters?.community.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isCurrent={false}
              showCustomize
            />
          ))}
        </div>
      </MainLayout>
    </>
  )
}
