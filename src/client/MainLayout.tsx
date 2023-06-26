import { Github } from 'lucide-react'
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
        <meta name="theme-color" content="#72A5A6"></meta>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-br from-cyan-500 to-amber-600">
        <div className="md: container flex flex-col gap-x-4 px-4 py-8 md:flex-row md:items-center">
          <Link
            href="/"
            className="flex-1 text-xl font-extrabold tracking-tight text-white"
          >
            Hans AI
          </Link>
          <div className="flex flex-row items-center gap-4">
            <Link
              href="https://teampilot.ai"
              target="_blank"
              className="flex-1 text-white hover:underline"
            >
              powered by <span className="text-cyan-400">Teampilot AI</span>
            </Link>
            <Link
              href="https://github.com/rechenberger/hans/tree/main"
              target="_blank"
            >
              <Github className="h-4 w-4 text-white hover:text-cyan-400" />
            </Link>
          </div>
        </div>
        <main className="container flex flex-col items-center justify-center gap-4 px-4 py-4 pb-8">
          {children}
        </main>
      </div>
    </>
  )
}
