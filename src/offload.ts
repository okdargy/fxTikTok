import { Context, Hono } from 'hono'
import { generate, respondAlternative } from './generate'
import generateActivity from './util/generateActivity'

const app = new Hono()
const PORT = 8787
const firstStart = Date.now()

export const logMiddleware = () => async (c: Context, next: () => Promise<void>) => {
  const url = c.req.url
  const userAgent = c.req.header('User-Agent') || 'Unknown'
  const startTime = Date.now()

  await next()

  const endTime = Date.now()
  const duration = endTime - startTime
  const status = c.res.status

  console.log(`[${new Date().toISOString()}] ${c.req.method} ${url} ${status} ${duration}ms - User-Agent: ${userAgent}`)
}

app.use('*', logMiddleware())

app.get('/', () => {
  return new Response(
    JSON.stringify({
      message: 'fxTikTok offload server is running!',
      github: 'https://github.com/shamu4life/fxtiktok-rewrite',
      uptime: Date.now() - firstStart
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    }
  )
})

app.get('/api/v1/statuses/:videoId', async (c) => respondAlternative(c))
app.get('/users/:username/statuses/:videoId', async (c) => respondAlternative(c))

app.route('/generate', generate)

export default {
  port: PORT,
  fetch: app.fetch
}

console.log(`fxTikTok offload server is running on port ${PORT}`)
