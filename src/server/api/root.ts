import { nodeRouter } from '~/server/api/routers/node.router'
import { createTRPCRouter } from '~/server/api/trpc'
import { billableRouter } from './routers/billable.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  node: nodeRouter,
  billable: billableRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
