import { useRouter } from 'next/router'
import { MainLayout } from '~/client/MainLayout'
import { DEFAULT_SYSTEM_MESSAGE } from '~/config'
import { api } from '~/utils/api'

export default function Page() {
  const router = useRouter()
  const { templateId } = router.query

  const { data: template } = api.node.get.useQuery(
    {
      id: templateId as string,
    },
    {
      enabled: !!templateId,
    }
  )

  const { mutate: start } = api.node.start.useMutation({
    onSuccess: async (data) => {
      await router.push(`/${data}`)
    },
  })

  return (
    <MainLayout>
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        Custom Hans
      </h1>
      <form
        className="flex w-full flex-col gap-4 text-white"
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          const data = Object.fromEntries(formData.entries())
          console.log(data)
          start(data as any)
        }}
      >
        <label className="flex flex-col">
          <div>Title</div>
          <input
            name="title"
            className="border bg-transparent p-2"
            defaultValue={template?.metadata.title}
          />
        </label>
        <label className="flex flex-col">
          <div>Description</div>
          <textarea
            name="description"
            className="border bg-transparent p-2"
            defaultValue={template?.metadata.description}
            rows={2}
          />
        </label>
        <label className="flex flex-col">
          <div>Image Description</div>
          <input
            name="imageDescription"
            className="border bg-transparent p-2"
            defaultValue={template?.metadata.imageDescription}
          />
        </label>
        <label className="flex flex-col">
          <div>System Message</div>
          <textarea
            name="systemMessage"
            className="border bg-transparent p-2"
            defaultValue={
              template?.metadata.systemMessage || DEFAULT_SYSTEM_MESSAGE
            }
            rows={10}
          />
        </label>
        <button
          type="submit"
          className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
        >
          <h3 className="text-2xl font-bold">Start →</h3>
        </button>
      </form>
    </MainLayout>
  )
}
