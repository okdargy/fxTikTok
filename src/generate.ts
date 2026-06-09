import { Context, Hono } from 'hono'
export const generate = new Hono()

import generateAlternate from './util/generateAlternate'
import generateActivity from './util/generateActivity'
import { withRoutePattern } from './metrics'
import { scrapePfpData, scrapeVideoData } from './services/tiktok'

export const awemeIdPattern = /^\d{1,19}$/
export const awemeLinkPattern = /\/@?([\w\d_.]*)\/(video|photo|live)\/?(\d{19})?/

export async function respondAlternative(c: Context) {
  const { videoId } = c.req.param()

  const content = JSON.stringify(await generateActivity(videoId, c))
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/activity+json; charset=utf-8',
      'Cache-Control': 'public, max-age=0'
    }
  })
}

generate.get(
  '/alternate',
  withRoutePattern('/generate/alternate', (c) => {
    const content = JSON.stringify(generateAlternate(c))
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  })
)

generate.get(
  '/video/:videoId',
  withRoutePattern('/generate/video/:videoId', async (c) => {
    const { videoId } = c.req.param()
    const hq = c.req.query('hq') === 'true' || c.req.query('quality') === 'hq'
    const userAgent = c.req.header('user-agent') || ''
    const isTelegramBot = userAgent.includes('TelegramBot')

    try {
      const data = await scrapeVideoData(videoId.split('.')[0])

      if (data instanceof Error) {
        return new Response((data as Error).message, {
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      }

      let playUrl: string | undefined

      // Helper to get the standard play URL
      // standard play URL is always h264 and available for all videos
      const getFallbackUrl = () => data.video?.PlayAddrStruct?.UrlList?.find((u: string) => u.includes('/aweme/v1/play/'))

      if (isTelegramBot) {
        const MAX_SIZE = 20971520 // 20MB in bytes, thanks @rafitamolin in #42

        const videosUnder20MB =
          data.video.bitrateInfo?.filter((b) => {
            const dataSize = parseInt(b.PlayAddr?.DataSize || '0')
            return dataSize > 0 && dataSize <= MAX_SIZE && !b.CodecType.includes('h265')
          }) || []

        // Find the largest available video within size limits
        const largestVideo = videosUnder20MB.sort(
          (a, b) => parseInt(b.PlayAddr?.DataSize || '0') - parseInt(a.PlayAddr?.DataSize || '0')
        )[0]

        playUrl = largestVideo?.PlayAddr?.UrlList?.find((u: string) => u.includes('/aweme/v1/play/'))

        if (!playUrl && parseInt(data.video?.PlayAddrStruct?.DataSize || '0') <= MAX_SIZE) {
          playUrl = getFallbackUrl()
        }
      } else if (hq) {
        const h265Video = data.video.bitrateInfo?.find((b) => b.CodecType.includes('h265'))
        playUrl = h265Video?.PlayAddr?.UrlList?.find((u: string) => u.includes('/aweme/v1/play/')) || getFallbackUrl()
      } else {
        playUrl = getFallbackUrl()
      }

      // For some reason, if you have any TikTok cookies set (meaning logged in), the normal CDN url redirects to a tiktok.com signed video.
      // To avoid this, we fetch the play URL and follow redirects manually to always get a direct video link.
      if (playUrl) {
        const response = await fetch(playUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            Accept: '*/*'
          },
          redirect: 'manual'
        })

        if (response.status === 302 || response.status === 301) {
          return c.redirect(response.headers.get('Location') || playUrl)
        } else {
          return response
        }
      } else {
        throw new Error('Could not find an aweme play URL')
      }
    } catch (e) {
      return new Response((e as Error).message, {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
)

generate.get(
  '/image/:videoId',
  withRoutePattern('/generate/image/:videoId', async (c) => {
    const { videoId } = c.req.param()
    const index = c.req.query('index') || 0

    if (!videoId) return new Response('Missing video ID', { status: 400 })
    if (!awemeIdPattern.test(videoId)) return new Response('Invalid video ID', { status: 400 })
    if (isNaN(Number(index))) return new Response('Invalid image index', { status: 400 })

    try {
      const data = await scrapeVideoData(videoId)

      if ('imagePost' in data && data.imagePost.images.length > 0 && +index < data.imagePost.images.length) {
        return c.redirect(data.imagePost.images[+index].imageURL.urlList[0])
      } else {
        throw new Error('Image not found')
      }
    } catch (e) {
      return new Response((e as Error).message, {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
)

generate.get(
  '/image/:videoId/:imageCount',
  withRoutePattern('/generate/image/:videoId/:imageCount', async (c) => {
    const { videoId, imageCount } = c.req.param()

    if (!videoId) return new Response('Missing video ID', { status: 400 })
    if (!awemeIdPattern.test(videoId)) return new Response('Invalid video ID', { status: 400 })

    if (isNaN(Number(imageCount)) || parseInt(imageCount) < 1) return new Response('Invalid image count', { status: 400 })
    const imageIndex = parseInt(imageCount) - 1 // 0-indexed

    try {
      const data = await scrapeVideoData(videoId)

      if (data instanceof Error) {
        return new Response((data as Error).message, {
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      }

      if (data.imagePost && data.imagePost.images && data.imagePost.images.length > 0) {
        if (imageIndex >= data.imagePost.images.length) {
          return new Response('Image index out of range', { status: 404 })
        }

        const imageUrl = data.imagePost.images[imageIndex].imageURL.urlList[0]
        return c.redirect(imageUrl)
      } else {
        // Fallback to TikWM API if no images found in data
        const images = await fetch('https://tikwm.com/api/', {
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: 'url=' + videoId + '&count=12&cursor=0&web=1&hd=1',
          method: 'POST'
        })

        const imageJson = (await images.json()) as { data: { images: string[] } }
        if (!imageJson.data.images[imageIndex]) return new Response('Image not found', { status: 404 })
        return c.redirect(imageJson.data.images[imageIndex])
      }
    } catch (e) {
      return new Response((e as Error).message, {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
)

generate.get(
  '/pfp/:author',
  withRoutePattern('/generate/pfp/:author', async (c) => {
    const { author } = c.req.param()

    try {
      const data = await scrapePfpData(author)

      if (data instanceof Error) {
        if (data.message === 'Restricted') return c.redirect('https://pldrs.tnktok.com/restricted.png')

        return new Response((data as Error).message, {
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      }

      return c.redirect(data.avatarMedium || data.avatarLarger || data.avatarThumb)
    } catch (e) {
      return new Response((e as Error).message, {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
)

generate.get(
  '/cover/:videoId',
  withRoutePattern('/generate/cover/:videoId', async (c) => {
    const { videoId } = c.req.param()

    if (!videoId) return new Response('Missing video ID', { status: 400 })
    if (!awemeIdPattern.test(videoId)) return new Response('Invalid video ID', { status: 400 })

    try {
      const data = await scrapeVideoData(videoId)

      if (data instanceof Error) {
        return new Response((data as Error).message, {
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        })
      }

      if (data.video.cover) {
        return c.redirect(data.video.originCover)
      } else {
        throw new Error('Cover not found')
      }
    } catch (e) {
      return new Response((e as Error).message, {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }
  })
)
