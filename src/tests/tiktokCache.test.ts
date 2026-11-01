import { readFileSync } from 'fs'
import * as redisModule from 'redis'
import { resolvePlayUrl, scrapeVideoData } from '@/services/tiktok'

const detail = JSON.parse(readFileSync(`${__dirname}/fixtures/video-detail.json`, 'utf8'))
const page = () =>
  new Response(
    `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify({
      __DEFAULT_SCOPE__: { 'webapp.video-detail': detail }
    })}</script>`
  )

afterEach(() => jest.restoreAllMocks())

describe('scrapeVideoData (overlapping requests)', () => {
  it('shares one TikTok fetch, then fetches again once it finishes', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => page())

    const [a, b] = await Promise.all([scrapeVideoData('7000000000000000001'), scrapeVideoData('7000000000000000001')])
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(a).toEqual(b)

    await scrapeVideoData('7000000000000000001')
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})

describe('with Redis', () => {
  const store = new Map<string, { ttl: number; value: string }>()

  beforeEach(() => {
    store.clear()
    process.env.REDIS_ENABLED = 'true'
    jest.spyOn(redisModule, 'createClient').mockReturnValue({
      on() {},
      connect: async () => {},
      get: async (key: string) => store.get(key)?.value ?? null,
      setEx: async (key: string, ttl: number, value: string) => void store.set(key, { ttl, value })
    } as any)
  })

  afterEach(() => {
    delete process.env.REDIS_ENABLED
  })

  it('asks the CDN once per play URL', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => new Response(null, { status: 302, headers: { Location: 'https://cdn.example/video' } }))

    expect(await resolvePlayUrl('https://www.tiktok.com/aweme/v1/play/?video_id=1')).toBe('https://cdn.example/video')
    expect(await resolvePlayUrl('https://www.tiktok.com/aweme/v1/play/?video_id=1')).toBe('https://cdn.example/video')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('does not cache an answer that is not a redirect', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('video', { status: 200 }))

    expect(await resolvePlayUrl('https://www.tiktok.com/aweme/v1/play/?video_id=2')).toBeInstanceOf(Response)
    expect(await resolvePlayUrl('https://www.tiktok.com/aweme/v1/play/?video_id=2')).toBeInstanceOf(Response)
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(store.size).toBe(0)
  })

  it('keeps avatars under the numeric id only, for longer than the video', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(async () => page())
    await scrapeVideoData('7000000000000000002')

    const { id, uniqueId } = detail.itemInfo.itemStruct.author
    expect(store.get(`tiktok:pfp:${id}`)?.ttl).toBe(46 * 3600)
    expect(store.has(`tiktok:pfp:${uniqueId}`)).toBe(false)
    expect(store.get('tiktok:video:7000000000000000002')?.ttl).toBe(86400)
  })
})
