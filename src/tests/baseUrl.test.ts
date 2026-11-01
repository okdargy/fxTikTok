import { Hono } from 'hono'
import { baseUrlMiddleware } from '@/util/baseUrl'

describe('baseUrl', () => {
  const app = new Hono().use('*', baseUrlMiddleware()).get('/', (c) => c.text(c.get('baseUrl')))
  const get = async (url: string, headers: Record<string, string> = {}) => (await app.request(url, { headers })).text()

  afterEach(() => {
    delete process.env.OFF_LOAD
  })

  it('defaults to the request origin', async () => {
    expect(await get('http://tikfix.example:3000/')).toBe('http://tikfix.example:3000')
  })

  it('uses https when the proxy says so, and ignores anything else', async () => {
    expect(await get('http://tikfix.example/', { 'X-Forwarded-Proto': 'https' })).toBe('https://tikfix.example')
    expect(await get('http://tikfix.example/', { 'X-Forwarded-Proto': 'javascript' })).toBe('http://tikfix.example')
  })

  it('prefers OFF_LOAD when set', async () => {
    process.env.OFF_LOAD = 'https://media.example'
    expect(await get('http://tikfix.example/')).toBe('https://media.example')
  })
})
