import Head from 'next/head'
import Link from 'next/link'
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
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="container flex flex-row px-4 py-8">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-white"
          >
            Hans AI
          </Link>
          <div className="flex-1" />
        </div>
        <main className="container flex flex-col items-center justify-center gap-8 px-4 py-16 ">
          {children}
        </main>
      </div>
    </>
  )
}
