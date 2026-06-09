import { Counter, Histogram, Registry } from 'prom-client'

const REQUEST_DURATION_BUCKETS = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]

const metricsRegistry = new Registry()


const requestsTotal = new Counter({
  name: 'fxtiktok_requests_total',
  help: 'Total HTTP requests grouped by route pattern, method, and status class.',
  labelNames: ['route', 'method', 'status_class'],
  registers: [metricsRegistry]
})

const requestDurationSeconds = new Histogram({
  name: 'fxtiktok_request_duration_seconds',
  help: 'HTTP request duration in seconds grouped by route pattern and method.',
  labelNames: ['route', 'method'],
  buckets: REQUEST_DURATION_BUCKETS,
  registers: [metricsRegistry]
})

const unhandledExceptionsTotal = new Counter({
  name: 'fxtiktok_unhandled_exceptions_total',
  help: 'Total uncaught exceptions grouped by route pattern, method, and exception type.',
  labelNames: ['route', 'method', 'exception_type'],
  registers: [metricsRegistry]
})

function getStatusClass(status: number): string {
  return `${Math.floor(status / 100)}xx`
}

export function withRoutePattern(routePattern: string, handler: (c: any) => Response | Promise<Response>) {
  return async (c: any) => {
    c.set('routePattern', routePattern)
    return handler(c)
  }
}

export function metricsMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    if (process.env.METRICS_ENABLED !== 'true') {
      await next()
      return
    }

    if (c.req.path === '/metrics' || c.req.path === '/favicon.ico') {
      await next()
      return
    }

    const startedAt = performance.now()
    let exceptionType: string | undefined

    try {
      await next()
    } catch (error) {
      exceptionType = error instanceof Error ? error.name : 'UnhandledError'
      throw error
    } finally {
      const route = c.get('routePattern') || 'unmatched'
      const method = c.req.method
      const status = exceptionType ? 500 : c.res.status || 500

      requestsTotal.inc({
        method,
        route,
        status_class: getStatusClass(status)
      })

      requestDurationSeconds.observe(
        {
          method,
          route
        },
        (performance.now() - startedAt) / 1000
      )

      if (exceptionType) {
        unhandledExceptionsTotal.inc({
          exception_type: exceptionType,
          method,
          route
        })
      }
    }
  }
}

export async function serveMetrics() {
  if (process.env.METRICS_ENABLED !== 'true') {
    return new Response('Not found', { status: 404 })
  }

  return new Response(await metricsRegistry.metrics(), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': metricsRegistry.contentType
    }
  })
}
