import app from '@/index'

describe('metrics routes', () => {
  const userAgent = 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'

  beforeEach(() => {
    process.env.METRICS_ENABLED = 'true'
  })

  afterEach(() => {
    delete process.env.METRICS_ENABLED
  })

  it('does not record /metrics scrapes as /:videoId traffic', async () => {
    let res = await app.request('/metrics')
    expect(res.status).toBe(200)
    let text = await res.text()
    expect(text).not.toContain('route="/:videoId"')

    res = await app.request('/metrics')
    expect(res.status).toBe(200)
    text = await res.text()
    expect(text).not.toContain('route="/:videoId"')
  })

  it('does not route browser favicon requests through /:videoId', async () => {
    const faviconRes = await app.request('/favicon.ico', {
      method: 'GET',
      headers: {
        'User-Agent': userAgent
      }
    })

    expect(faviconRes.status).toBe(204)

    const metricsRes = await app.request('/metrics')
    const text = await metricsRes.text()

    expect(text).not.toContain('route="/:videoId"')
  })
})
