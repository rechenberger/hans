import { env } from '~/env.mjs'

export const sendDiscordMessage = async ({ content }: { content: string }) => {
  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  })
}
