import { map } from 'lodash-es'
import Link from 'next/link'
import { Fragment } from 'react'
import { MainLayout } from '~/client/MainLayout'
import { api } from '~/utils/api'

export default function Page() {
  const { data } = api.billable.getBudget.useQuery()

  return (
    <MainLayout>
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        Budget
      </h1>
      <div className="grid grid-cols-2 gap-2 rounded bg-black/20 p-2 text-white">
        {map(data, (budget, key) => (
          <Fragment key={key}>
            <div>{key}</div>
            <div className="font-bold text-cyan-400">
              {budget.costsInTeamTokens} TTs
            </div>
          </Fragment>
        ))}
      </div>
      <Link
        href="https://teampilot.ai"
        target="_blank"
        className="text-white hover:underline"
      >
        powered by <span className="text-cyan-400">Teampilot AI</span>
      </Link>
    </MainLayout>
  )
}
