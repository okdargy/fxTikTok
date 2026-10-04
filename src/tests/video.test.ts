import app from '@/index'

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

  it('should return 500', async () => {
    const res = await app.request('/@i/video/123', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      }
    })

    expect(res.status).toBe(500)
    expect(await res.text()).toContain('An error occurred while trying to fetch data. Please try again later.')
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

  it('should return 500', async () => {
    const res = await app.request('/generate/video/123', {
      method: 'GET'
    })

    expect(res.status).toBe(500)
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
