import { Context, Hono } from 'hono'
import { generate, respondAlternative } from './generate'
import { metricsMiddleware, serveMetrics, withRoutePattern } from './metrics'

const app = new Hono()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8787
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

app.use('*', metricsMiddleware())
app.use('*', logMiddleware())

app.get(
  '/',
  withRoutePattern('/', () => {
    return new Response(
      JSON.stringify({
        message: 'fxTikTok offload server is running!',
        github: 'https://github.com/okdargy/fxTikTok',
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
)

app.get('/metrics', serveMetrics)

for (const path of ['/api/v1/statuses/:videoId', '/users/:username/statuses/:videoId']) {
  app.get(path, withRoutePattern(path, respondAlternative))
}

app.route('/generate', generate)

export default {
  port: PORT,
  fetch: app.fetch
}

console.log(`fxTikTok offload server is running on port ${PORT}`)
