import { readFileSync } from 'fs'
import app from '@/index'
import { scrapeVideoData } from '@/services/tiktok'
import { trimVideoDetail } from '@/util/trimData'

describe('GET /@i/video/:videoId', () => {
  it('should return 200', async () => {
    const res = await app.request('/@pr4yforgabs/video/7332187682480590112', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(200)
  })

  it('should return 200 (h.265)', async () => {
    const res = await app.request('/@pr4yforgabs/video/7332187682480590112?hq=true', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('?hq=true')
  })

  it('should return 200 (description)', async () => {
    const res = await app.request('/@pr4yforgabs/video/7332187682480590112?addDesc=true', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('description=')
  })

  // no discord user agent, redirects
  it('should return 302', async () => {
    const res = await app.request('/@pr4yforgabs/video/7332187682480590112', {
      method: 'GET'
    })

    expect(res.status).toBe(302)
  })

  it('should return 404', async () => {
    const res = await app.request('/@i/video/123', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(404)
    expect(await res.text()).toContain('It may have been deleted, made private, or restricted by TikTok.')
  })
})

describe('GET /@i/video/:videoId (age restricted)', () => {
  it('should return 200', async () => {
    const res = await app.request('/@cnn/video/7592870340661873933', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('⚠️')
  })
})

describe('GET /@i/video/:videoId (unavailable)', () => {
  afterEach(() => jest.restoreAllMocks())

  it('should return 404 for region-blocked videos', async () => {
    const data = { __DEFAULT_SCOPE__: { 'webapp.video-detail': { statusCode: 10231, statusMsg: 'cross_border_violation' } } }
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(`<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify(data)}</script>`)
      )

    const res = await app.request('/@i/video/7681251974356012306', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(404)
  })
})

describe('scrapeVideoData (fresh scrape)', () => {
  afterEach(() => jest.restoreAllMocks())

  it('returns the same trimmed data that gets cached', async () => {
    const detail = JSON.parse(readFileSync(`${__dirname}/fixtures/video-detail.json`, 'utf8'))
    const data = { __DEFAULT_SCOPE__: { 'webapp.video-detail': detail } }
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(`<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify(data)}</script>`)
      )

    expect(await scrapeVideoData(detail.itemInfo.itemStruct.id)).toEqual(
      JSON.parse(JSON.stringify(trimVideoDetail(detail))).itemInfo.itemStruct
    )
  })
})

describe('GET /t/:videoId', () => {
  it('should return 200', async () => {
    const res = await app.request('/t/ZPLRh3CsY', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(200)
  })
})

describe('GET /generate/video/:videoId', () => {
  it('should return 302', async () => {
    const res = await app.request('/generate/video/7332187682480590112', {
      method: 'GET'
    })

    expect(res.status).toBe(302)
  })

  it('should return 302 (h.265)', async () => {
    const res = await app.request('/generate/video/7332187682480590112?hq=true', {
      method: 'GET'
    })

    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toContain('video/tos')
  })

  it('should return 404 (age restricted)', async () => {
    const res = await app.request('/generate/video/7592870340661873933', {
      method: 'GET'
    })

    expect(res.status).toBe(404)
  })

  it('should return 404', async () => {
    const res = await app.request('/generate/video/123', {
      method: 'GET'
    })

    expect(res.status).toBe(404)
  })
})

describe('GET /generate/alternate', () => {
  it('should return 200 (English)', async () => {
    const res = await app.request(
      '/generate/alternate?description=I2Z5ICNmb3J5b3UgI3N0cmF3YmVycnkgI2Nob2NvbGF0ZSAjY2hvY29sYXRlY292ZXJlZHN0cmF3YmVycmllcyA%253D',
      {
        method: 'GET'
      }
    )

    expect(res.status).toBe(200)
    const jsonResponse = (await res.json()) as { provider_name: string }
    expect(jsonResponse.provider_name).toEqual('#fy #foryou #strawberry #chocolate #chocolatecoveredstrawberries ')
  })

  it('should return 200 (Russian)', async () => {
    const res = await app.request(
      '/generate/alternate?description=0JXRgdGC0Ywg0LIg0LrQvtC80LzQtdC90YLQsNGA0LjRj9GFINC%252F0LXRgNC10LLQvtC00YfQuNC60Lgg0YEg0Y%252FQt9GL0LrQsCDQv9GA0LjRiNC10LvRjNGG0LXQsj8g8J%252BRvSDwn5O5OiBhcmllbGlwaWxsbw%253D%253D',
      {
        method: 'GET'
      }
    )

    expect(res.status).toBe(200)
    const jsonResponse = (await res.json()) as { provider_name: string }
    expect(jsonResponse.provider_name).toEqual('Есть в комментариях переводчики с языка пришельцев? 👽 📹: arielipillo')
  })
})
