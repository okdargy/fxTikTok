import { Hono } from 'hono'
import { scrapeLiveData, scrapeProfileData, scrapeVideoData } from './services/tiktok'
import { grabAwemeId } from './services/tiktok'
import { VideoResponse, ErrorResponse, LiveResponse, WarningResponse } from './templates'
import { returnHTMLResponse } from './util/responseHelper'
import { env } from 'hono/adapter'
import { generate, respondAlternative, awemeIdPattern, awemeLinkPattern } from './generate'
import { ProfileResponse } from './templates/pages/ProfileResponse'
import { metricsMiddleware, serveMetrics, withRoutePattern } from './metrics'

const app = new Hono()
app.use('*', metricsMiddleware())

// Credit: https://github.com/FixTweet/FxTwitter/blob/main/src/constants.ts#L24
const BOT_REGEX =
  /bot|facebook|embed|got|firefox\/92|firefox\/38|curl|wget|go-http|yahoo|generator|whatsapp|revoltchat|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|cfnetwork|node|mastodon|http\.rb|ruby|bun\/|fiddler|iframely|steamchaturllookup/i

app.get('/', () => {
  return new Response('', {
    status: 302,
    headers: {
      Location: 'https://github.com/shamu4life/fxtiktok-rewrite'
    }
  })
)

app.get('/favicon.ico', () => new Response(null, { status: 204 }))

async function handleShort(c: any): Promise<Response> {
  const { videoId } = c.req.param()
  if (videoId.startsWith('@')) return handleProfile(videoId.startsWith('@') ? videoId.substring(1) : videoId, c) // since its a short url (/@username), busted way of doing this since its technically defined as videoId. it's 12 am ok
  let id = videoId.split('.')[0] // for .mp4, .webp, etc.

  const link = await grabAwemeId(id)

  // Clean any tracking parameters
  link.search = ''

  // If the user agent is a bot, redirect to the TikTok page
  if (!BOT_REGEX.test(c.req.header('User-Agent') || '')) {
    return new Response('', {
      status: 302,
      headers: {
        Location: 'https://www.tiktok.com' + link.pathname
      }
    })
  }

  // Extract the actual aweme ID from the resolved link
  let resolvedId = id
  if (link.pathname.includes('/video') || link.pathname.includes('/photo')) {
    const match = link.pathname.match(awemeLinkPattern)
    if (match) resolvedId = match[3]
    return processVideo(c, resolvedId)
  } else if (link.pathname.includes('/live')) {
    const match = link.pathname.match(awemeLinkPattern)
    let authorName = ''
    if (match) authorName = match[1]
    return processLive(c, authorName)
  } else {
    const responseContent = await ErrorResponse('Invalid vm link', c)
    return returnHTMLResponse(responseContent, 400)
  }
}

async function handleProfile(author: string, c: any): Promise<Response> {
  // If the user agent is a bot, redirect to the TikTok page
  if (!BOT_REGEX.test(c.req.header('User-Agent') || '')) {
    const url = new URL(c.req.url)

    // Remove tracking parameters
    url.search = ''

    return new Response('', {
      status: 302,
      headers: {
        Location: 'https://www.tiktok.com' + url.pathname
      }
    })
  }

  const profileInfo = await scrapeProfileData(author)

  if (profileInfo instanceof Error) {
    const responseContent = await ErrorResponse((profileInfo as Error).message, c)
    return returnHTMLResponse(responseContent, 500)
  }

  const responseContent = await ProfileResponse(profileInfo, c)
  return returnHTMLResponse(responseContent)
}

async function handleVideo(c: any): Promise<Response> {
  const { videoId } = c.req.param()
  let id = videoId.split('.')[0] // for .mp4, .webp, etc.

  // If the user agent is a bot, redirect to the TikTok page
  if (!BOT_REGEX.test(c.req.header('User-Agent') || '')) {
    const url = new URL(c.req.url)

    // Remove tracking parameters
    url.search = ''

    return new Response('', {
      status: 302,
      headers: {
        Location: 'https://www.tiktok.com' + url.pathname
      }
    })
  }

  if (!awemeIdPattern.test(id)) {
    console.log(`Aweme ID pattern did not match for ID: ${id}`)
    const url = await grabAwemeId(id)
    const match = url.pathname.match(awemeLinkPattern)

    if (match) {
      id = match[3]
    } else {
      const responseContent = await ErrorResponse('Invalid video ID', c)
      return returnHTMLResponse(responseContent, 400)
    }
  }

  return processVideo(c, id)
}

async function processVideo(c: any, id: string): Promise<Response> {
  if (!id) return new Response('Missing video ID', { status: 400 })
  const { addDesc, hq } = c.req.query()

  try {
    const videoInfo = await scrapeVideoData(id)

    if (videoInfo instanceof Error) {
      const responseContent = await ErrorResponse((videoInfo as Error).message, c)
      return returnHTMLResponse(responseContent, 500)
    }

    const url = new URL(c.req.url)
    const extensions = ['mp4', 'png', 'jpg', 'jpeg', 'webp', 'webm']

    if (url.hostname.includes('d.') || c.req.query('isDirect') === 'true' || extensions.some((suffix) => c.req.path.endsWith(suffix))) {
      const { OFF_LOAD } = env(c) as { OFF_LOAD: string }
      const offloadUrl = OFF_LOAD || 'https://offload.tnktok.com'

      if (videoInfo.video.duration > 0) {
        if ((hq || 'false').toLowerCase() == 'true' || url.hostname.includes('hq.')) {
          return new Response('', {
            status: 302,
            headers: {
              Location: offloadUrl + '/generate/video/' + videoInfo.id + '?hq=true'
            }
          })
        } else {
          return new Response('', {
            status: 302,
            headers: {
              Location: offloadUrl + '/generate/video/' + videoInfo.id
            }
          })
        }
      } else {
        return new Response('', {
          status: 302,
          headers: {
            Location: offloadUrl + '/generate/image/' + videoInfo.id
          }
        })
      }
    } else {
      if (videoInfo.isContentClassified === true) {
        const responseContent = await WarningResponse('Sensitive Content', 'the video being age-restricted', c)
        return returnHTMLResponse(responseContent, 200)
      }

      const responseContent = await VideoResponse(
        videoInfo,
        (addDesc || 'false').toLowerCase() == 'true' || url.hostname.includes('a.'),
        (hq || 'false').toLowerCase() == 'true' || url.hostname.includes('hq.'),
        c
      )
      return returnHTMLResponse(responseContent)
    }
  } catch (e) {
    const responseContent = await ErrorResponse((e as Error).message, c)
    return returnHTMLResponse(responseContent, 500)
  }
}

async function handleLive(c: any): Promise<Response> {
  const { author, videoId } = c.req.param()
  let authorName = author

  // If the user agent is a bot, redirect to the TikTok page
  if (!BOT_REGEX.test(c.req.header('User-Agent') || '')) {
    const url = new URL(c.req.url)

    // Remove tracking parameters
    url.search = ''

    return new Response('', {
      status: 302,
      headers: {
        Location: 'https://www.tiktok.com' + url.pathname
      }
    })
  }

  if (!author && !awemeIdPattern.test(videoId)) {
    const url = await grabAwemeId(videoId)
    const match = url.pathname.match(awemeLinkPattern)

    if (match) {
      authorName = match[1]
    } else {
      const responseContent = await ErrorResponse('Invalid live ID', c)
      return returnHTMLResponse(responseContent, 400)
    }
  }

  authorName = authorName.startsWith('@') ? authorName.substring(1) : authorName

  return processLive(c, authorName)
}

async function processLive(c: any, authorName: string): Promise<Response> {
  try {
    const liveData = await scrapeLiveData(authorName)

    if (liveData instanceof Error) {
      const responseContent = await ErrorResponse((liveData as Error).message, c)
      return returnHTMLResponse(responseContent, 500)
    }

    const responseContent = await LiveResponse(liveData, c)
    return returnHTMLResponse(responseContent)
  } catch (e) {
    const responseContent = await ErrorResponse((e as Error).message, c)
    return returnHTMLResponse(responseContent, 500)
  }
}

app.get('/metrics', serveMetrics)

app.get(
  '/api/v1/statuses/:videoId',
  withRoutePattern('/api/v1/statuses/:videoId', async (c) => respondAlternative(c))
)
app.get(
  '/users/:username/statuses/:videoId',
  withRoutePattern('/users/:username/statuses/:videoId', async (c) => respondAlternative(c))
)

app.route('/generate', generate)

const routes = [
  {
    path: '/:videoId',
    handler: handleShort
  },
  {
    path: '/t/:videoId',
    handler: handleShort
  },
  {
    path: '/*/video/:videoId',
    handler: handleVideo
  },
  {
    path: '/*/photo/:videoId',
    handler: handleVideo
  },
  {
    path: '/:author/live',
    handler: handleLive
  }
]

// temp-fix: add trailing slash to all routes
routes.forEach((route) => {
  app.get(route.path, withRoutePattern(route.path, route.handler))
  app.get(route.path + '/', withRoutePattern(route.path, route.handler))
})

export default {
  ...(process.env.PORT ? { port: parseInt(process.env.PORT) } : {}),
  ...app
}
