import { Context } from 'hono'
import { env } from 'hono/adapter'

declare module 'hono' {
  interface ContextVariableMap {
    baseUrl: string
  }
}

export const baseUrlMiddleware = () => async (c: Context, next: () => Promise<void>) => {
  const { OFF_LOAD } = env(c) as { OFF_LOAD?: string }
  const url = new URL(c.req.url)

  const https = c.req.header('x-forwarded-proto')?.split(',')[0].trim() === 'https'
  c.set('baseUrl', OFF_LOAD || (https ? 'https:' : url.protocol) + '//' + url.host)
  await next()
}
