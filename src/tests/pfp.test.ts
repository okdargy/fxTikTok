import app from '@/index'

function mockUserDetail(detail?: object) {
  const data = { __DEFAULT_SCOPE__: detail ? { 'webapp.user-detail': detail } : {} }
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(`<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">${JSON.stringify(data)}</script>`)
    )
}

describe('GET /generate/pfp/:author', () => {
  afterEach(() => jest.restoreAllMocks())

  it.each([
    [10221, 'user banned'],
    [10202, 'no user'],
    [10223, 'ftc user']
  ])('returns 404 when TikTok answers %i (%s)', async (statusCode, statusMsg) => {
    mockUserDetail({ statusCode, statusMsg })
    expect((await app.request('/generate/pfp/7017043720068891653')).status).toBe(404)
  })

  it('still redirects restricted users to the placeholder', async () => {
    mockUserDetail({ statusCode: 209002 })
    const res = await app.request('/generate/pfp/7017043720068891653')
    expect(res.status).toBe(302)
    expect(res.headers.get('Location')).toBe('https://pldrs.tnktok.com/restricted.png')
  })

  it('still returns 500 when TikTok sends no user data', async () => {
    mockUserDetail()
    expect((await app.request('/generate/pfp/7017043720068891653')).status).toBe(500)
  })
})
