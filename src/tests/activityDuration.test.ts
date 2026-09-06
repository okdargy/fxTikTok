import { Hono } from 'hono'
import { scrapeVideoData } from '@/services/tiktok'
import type { ItemStruct } from '@/types/Web'
import generateActivity from '@/util/generateActivity'

jest.mock('@/services/tiktok', () => ({ scrapeVideoData: jest.fn() }))

const scrape = jest.mocked(scrapeVideoData)
const app = new Hono()
app.get('/', async (c) => c.json(await generateActivity('7000000000000000000', c)))

async function status(duration: unknown, photo = false) {
  scrape.mockResolvedValue({
    createTime: '1700000000',
    desc: '',
    video: { playAddr: 'https://example.com/video.mp4', width: 576, height: 1024, duration },
    author: { id: 'author', uniqueId: 'example', nickname: 'Example', createTime: '1700000000' },
    stats: { diggCount: 1, commentCount: 2, shareCount: 3 },
    ...(photo ? { imagePost: { images: [{ imageWidth: 576, imageHeight: 1024 }] } } : {})
  } as unknown as ItemStruct)
  const response = await app.request('/')
  expect(response.status).toBe(200)
  return response.json() as Promise<{
    media_attachments: { type: string; meta: { original: { width: number; height: number; duration?: number } } }[]
  }>
}

describe('status attachment duration', () => {
  beforeEach(() => scrape.mockReset())

  it.each([30, 30.5, 0.5])('includes %s seconds without another lookup', async (duration) => {
    const body = await status(duration)
    expect(body.media_attachments[0]).toMatchObject({
      type: 'video',
      meta: { original: { width: 576, height: 1024, duration } }
    })
    expect(scrape).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, null, 0, -1, '30', NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'omits an unusable duration %s without dropping the video',
    async (duration) => {
      const body = await status(duration)
      expect(body.media_attachments[0]).toMatchObject({ type: 'video', meta: { original: { width: 576, height: 1024 } } })
      expect(body.media_attachments[0].meta.original).not.toHaveProperty('duration')
    }
  )

  it('omits duration from photo posts including their video attachment', async () => {
    const body = await status(30, true)
    expect(body.media_attachments.map((media) => media.type)).toEqual(['video', 'image'])
    for (const media of body.media_attachments) expect(media.meta.original).not.toHaveProperty('duration')
  })
})
