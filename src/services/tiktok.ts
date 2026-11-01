import { WebJSONResponse, ItemStruct, WebappUserDetail, WebappVideoDetail, UserInfo, DetailUser } from '../types/Web'
import { LiveWebJSONResponse, LiveRoom } from '../types/Live'
import Cookie from '../util/cookieHelper'
import { trimPfp, trimUserDetail, trimVideoDetail } from '../util/trimData'
import cookieParser from 'set-cookie-parser'
import { createClient } from 'redis'
import { getRuntimeKey } from 'hono/adapter'
import { cacheLookupsTotal } from '../metrics'

const cookie = new Cookie([])

let redisClient: ReturnType<typeof createClient> | null = null
const REDIS_TTL = 86400
const PFP_TTL = 46 * 3600 // TikTok's avatar links last about 48h, and old embeds keep asking for avatars long after that
const PLAY_REDIRECT_TTL = 3600 // the CDN links last about 6h
const NOT_FOUND_TTL = 600 // deleted videos stay cached briefly, in case they were only under review

export class NotFoundError extends Error {}

async function getRedisClient() {
  if (process.env.REDIS_ENABLED !== 'true') return null

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    })

    redisClient.on('error', (err) => console.error('Redis Client Error', err))

    try {
      await redisClient.connect()
    } catch (err) {
      console.error('Failed to connect to Redis:', err)
      return null
    }
  }

  return redisClient
}

function getCommonHeaders(): HeadersInit {
  return {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    Cookie: cookie.getCookiesAsString()
  }
}

function processCookies(response: Response): void {
  const cookieHeader = response.headers.get('set-cookie')
  if (cookieHeader) {
    const cookies = cookieParser(cookieHeader)
    cookie.setCookies(cookies)
  }
}

function extractJsonFromScript(html: string, scriptId: string): string {
  const startTag = `<script id="${scriptId}" type="application/json">`
  const endTag = '</script>'

  const startIndex = html.indexOf(startTag)
  if (startIndex === -1) throw new Error(`Script tag with id "${scriptId}" not found`)

  const jsonStart = startIndex + startTag.length
  const jsonEnd = html.indexOf(endTag, jsonStart)
  if (jsonEnd === -1) throw new Error(`End tag not found for script "${scriptId}"`)

  return html.substring(jsonStart, jsonEnd)
}

async function fetchTikTokPage(url: string, cacheOptions?: any): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: getCommonHeaders(),
    ...(cacheOptions && { cf: cacheOptions })
  })

  processCookies(response)
  return await response.text()
}

// Requests for one uncached page often overlap, so they share a fetch. Workers can't await a promise from another request.
const shareFetches = getRuntimeKey() !== 'workerd'
const inFlight = new Map<string, Promise<WebappUserDetail | WebappVideoDetail | Error>>()

export async function grabAwemeId(videoId: string): Promise<URL> {
  const redis = await getRedisClient()
  const cacheKey = `tiktok:aweme:${videoId}`

  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      cacheLookupsTotal.inc({ kind: 'aweme', result: cached ? 'hit' : 'miss' })
      if (cached) {
        return new URL(cached)
      }
    } catch (err) {
      console.error('Redis error:', err)
    }
  }

  const res = await fetch('https://vm.tiktok.com/' + videoId, {
    cf: {
      cacheEverything: false,
      cacheTtlByStatus: { '301-302': 86400, 404: 1, '500-599': 0 }
    },
    redirect: 'manual'
  })

  let location = res.headers.get('Location') || res.headers.get('location')
  if (!location) throw new Error('No Location header found in response')

  // patch: if the location includes /v/, extract the id and format it properly
  // somehow popped up after oracle update, i have no idea why
  if (location.includes('/v/')) {
    const urlObj = new URL(location)
    const videoIdPart = urlObj.pathname.match(/\/v\/[^\/]+/)

    if (videoIdPart && videoIdPart[0]) {
      const awemeId = videoIdPart[0].replace('/v/', '').split('.')[0]
      location = `https://www.tiktok.com/@unknown/video/${awemeId}`
    }
  }

  if (redis) {
    try {
      await redis.setEx(cacheKey, REDIS_TTL, location)
    } catch (err) {
      console.error('Redis set error:', err)
    }
  }

  return new URL(location)
}

export async function scrapePageData(id: string, scopeType: 'video', cacheOptions?: any): Promise<WebappVideoDetail | Error>

export async function scrapePageData(id: string, scopeType: 'user', cacheOptions?: any): Promise<WebappUserDetail | Error>

export async function scrapePageData(
  id: string,
  scopeType: 'video' | 'user',
  cacheOptions?: any
): Promise<WebappUserDetail | WebappVideoDetail | Error> {
  if (!shareFetches) return loadPageData(id, scopeType, cacheOptions)

  const key = `${scopeType}:${id}`
  let pending = inFlight.get(key)
  if (!pending) {
    pending = loadPageData(id, scopeType, cacheOptions).finally(() => inFlight.delete(key))
    inFlight.set(key, pending)
  }
  return pending
}

async function loadPageData(
  id: string,
  scopeType: 'video' | 'user',
  cacheOptions?: any
): Promise<WebappUserDetail | WebappVideoDetail | Error> {
  const scope = scopeType == 'video' ? 'webapp.video-detail' : scopeType == 'user' ? 'webapp.user-detail' : scopeType
  const cacheKey = `tiktok:${scopeType}:${id}`

  try {
    const redis = await getRedisClient()

    if (redis) {
      try {
        const cached = await redis.get(cacheKey)
        cacheLookupsTotal.inc({ kind: scopeType, result: cached ? 'hit' : 'miss' })
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (redisErr) {
        console.error('Redis error:', redisErr)
      }
    }

    const url = scopeType === 'video' ? `https://www.tiktok.com/@i/video/${id}` : `https://www.tiktok.com/@${id}`
    const html = await fetchTikTokPage(url, cacheOptions)
    const resJson = extractJsonFromScript(html, '__UNIVERSAL_DATA_FOR_REHYDRATION__')
    const json: WebJSONResponse = JSON.parse(resJson)

    const scopeData = json['__DEFAULT_SCOPE__'][scope]
    if (!scopeData) return new Error(`Could not find ${scopeType} data`)

    const trimmed = JSON.stringify(
      scopeType == 'video' ? trimVideoDetail(scopeData as WebappVideoDetail) : trimUserDetail(scopeData as WebappUserDetail)
    )

    if (scopeData.statusCode === 10204) {
      if (redis) {
        try {
          await redis.setEx(cacheKey, NOT_FOUND_TTL, trimmed)
        } catch (redisErr) {
          console.error('Redis set error:', redisErr)
        }
      }

      return new NotFoundError(`Could not find ${scopeType} data`)
    } else {
      if (redis) {
        try {
          await redis.setEx(cacheKey, REDIS_TTL, trimmed)

          if (scopeType == 'video') {
            const videoData = scopeData as WebappVideoDetail
            const user = videoData?.itemInfo?.itemStruct?.author

            if (user?.id && user?.uniqueId) {
              await redis.setEx(`tiktok:pfp:${user.id}`, PFP_TTL, JSON.stringify(trimPfp(user)))
            }
          } else if (scopeType == 'user') {
            const userData = scopeData as WebappUserDetail

            if (userData?.userInfo) {
              const user = userData.userInfo.user

              if (user?.id && user?.uniqueId) {
                await redis.setEx(`tiktok:pfp:${user.id}`, PFP_TTL, JSON.stringify(trimPfp(user)))

                const idKey = `tiktok:user:${user.id}`

                if (idKey !== cacheKey) {
                  await redis.setEx(idKey, REDIS_TTL, trimmed)
                } else {
                  await redis.setEx(`tiktok:user:${user.uniqueId}`, REDIS_TTL, trimmed)
                }
              }
            }
          }
        } catch (redisErr) {
          console.error('Redis set error:', redisErr)
        }
      }
    }

    return JSON.parse(trimmed)
  } catch (err) {
    return new Error(`Could not parse ${scopeType} data`)
  }
}

export async function scrapeVideoData(awemeId: string, author?: string): Promise<ItemStruct | Error> {
  const result = await scrapePageData(awemeId, 'video', {
    cacheEverything: false,
    cacheTtlByStatus: { '200-299': 86400, 404: 1, '500-599': 0 }
  })

  if (result instanceof Error) return result
  // 10204 (deleted, cached briefly), 10222 (private author), 10231 (region-blocked) etc.
  if (result.statusCode) return new NotFoundError('Could not find video data')
  if (!result.itemInfo?.itemStruct) return new Error('Could not find video data')
  return result.itemInfo.itemStruct
}

export async function resolvePlayUrl(playUrl: string): Promise<string | Response> {
  const redis = await getRedisClient()
  const cacheKey = `tiktok:play:${playUrl}`

  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      cacheLookupsTotal.inc({ kind: 'play', result: cached ? 'hit' : 'miss' })
      if (cached) return cached
    } catch (err) {
      console.error('Redis error:', err)
    }
  }

  const response = await fetch(playUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      Accept: '*/*'
    },
    redirect: 'manual'
  })

  if (response.status !== 301 && response.status !== 302) return response

  const location = response.headers.get('Location')
  if (location && redis) {
    try {
      await redis.setEx(cacheKey, PLAY_REDIRECT_TTL, location)
    } catch (err) {
      console.error('Redis set error:', err)
    }
  }

  return location || playUrl
}

export async function scrapePfpData(username: string): Promise<DetailUser | Error> {
  const redis = await getRedisClient()

  if (redis) {
    const cacheKey = `tiktok:pfp:${username}`
    try {
      const cached = await redis.get(cacheKey)
      cacheLookupsTotal.inc({ kind: 'pfp', result: cached ? 'hit' : 'miss' })
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (redisErr) {
      console.error('Redis error:', redisErr)
    }
  }

  const result = await scrapePageData(username, 'user')

  if (result instanceof Error) return result
  if (result.statusCode == 209004 || result.statusCode == 209002) return new Error('Restricted')
  if (result.statusCode) return new NotFoundError('Could not find user data')
  if (!result.userInfo) return new Error('Could not find user data')

  return result.userInfo.user
}

export async function scrapeProfileData(username: string): Promise<UserInfo | Error> {
  const result = await scrapePageData(username, 'user')

  if (result instanceof Error) return result
  if (!result.userInfo) return new Error('Could not find user data')

  return result.userInfo
}

export async function scrapeLiveData(author: string): Promise<LiveRoom | Error> {
  try {
    const html = await fetchTikTokPage(`https://www.tiktok.com/@${author}/live`)
    const resJson = extractJsonFromScript(html, 'SIGI_STATE')
    const json: LiveWebJSONResponse = JSON.parse(resJson)

    if (!json['LiveRoom']) {
      throw new Error('Could not find live data')
    }

    return json['LiveRoom']
  } catch (err) {
    throw new Error('Could not parse live data')
  }
}
