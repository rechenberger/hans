import Head from 'next/head'
import { type ReactNode } from 'react'

export const MainLayout = ({
  title,
  children,
}: {
  title?: string
  children?: ReactNode
}) => {
  return (
    <>
      <Head>
        <title>{title ? `${title} | Hans AI` : 'Hans AI'}</title>
        <link rel="icon" href="/hanns.png" />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-amber-600">
        <main className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {children}
        </main>
      </div>
    </>
  )
}
