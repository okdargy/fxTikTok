import { Context, Hono } from 'hono'
import { grabAwemeId, NotFoundError, scrapeLiveData, scrapeProfileData, scrapeVideoData } from './services/tiktok'
import { VideoResponse, ErrorResponse, LiveResponse, WarningResponse } from './templates'
import { returnHTMLResponse } from './util/responseHelper'
import { generate, respondAlternative, awemeIdPattern, awemeLinkPattern } from './generate'
import { ProfileResponse } from './templates/pages/ProfileResponse'
import { metricsMiddleware, serveMetrics, withRoutePattern } from './metrics'
import { baseUrlMiddleware } from './util/baseUrl'

const app = new Hono()

const logMiddleware = () => async (c: Context, next: () => Promise<void>) => {
  const startTime = Date.now()
  await next()
  console.log(
    `[${new Date().toISOString()}] ${c.req.method} ${c.req.url} ${c.res.status} ${Date.now() - startTime}ms - User-Agent: ${c.req.header('User-Agent') || 'Unknown'}`
  )
}

app.use('*', metricsMiddleware())
app.use('*', logMiddleware())
app.use('*', baseUrlMiddleware())

// Credit: https://github.com/FixTweet/FxTwitter/blob/main/src/constants.ts#L59
const BOT_REGEX =
  /bot|facebook|embed|got|firefox\/92|firefox\/38|chrome\/96\.0\.4664\.110|curl|wget|go-http|yahoo|generator|whatsapp|revoltchat|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|node|deno|mastodon|http\.rb|ruby|bun\/|fiddler|iframely|steamchaturllookup|bluesky|matrix-media-repo|cardyb|resolver|util|feedly|rss|reader|atom|thunderbird|axios/i

const isBot = (c: Context) => BOT_REGEX.test(c.req.header('User-Agent') || '')
const redirectToTikTok = (c: Context, path = c.req.path) => c.redirect('https://www.tiktok.com' + path)

async function errorPage(c: Context, message: string, status = 500, description?: string): Promise<Response> {
  return returnHTMLResponse(await ErrorResponse(message, c, description), status)
}

app.get(
  '/',
  withRoutePattern('/', (c) => c.redirect('https://github.com/okdargy/fxtiktok'))
)

app.get('/favicon.ico', () => new Response(null, { status: 204 }))

async function handleShort(c: any): Promise<Response> {
  const { videoId } = c.req.param()
  if (videoId.startsWith('@')) return handleProfile(videoId.substring(1), c) // since its a short url (/@username), busted way of doing this since its technically defined as videoId. it's 12 am ok
  const id = videoId.split('.')[0] // for .mp4, .webp, etc.

  const link = await grabAwemeId(id)
  if (!isBot(c)) return redirectToTikTok(c, link.pathname)

  const match = link.pathname.match(awemeLinkPattern)
  if (link.pathname.includes('/video') || link.pathname.includes('/photo')) return processVideo(c, match ? match[3] : id)
  if (link.pathname.includes('/live')) return processLive(c, match ? match[1] : '')
  return errorPage(c, 'Invalid vm link', 400)
}

async function handleProfile(author: string, c: any): Promise<Response> {
  if (!isBot(c)) return redirectToTikTok(c)

  const profileInfo = await scrapeProfileData(author)
  if (profileInfo instanceof Error) return errorPage(c, profileInfo.message)

  return returnHTMLResponse(await ProfileResponse(profileInfo, c))
}

async function handleVideo(c: any): Promise<Response> {
  if (!isBot(c)) return redirectToTikTok(c)

  let id = c.req.param('videoId').split('.')[0]
  if (!awemeIdPattern.test(id)) {
    console.log(`Aweme ID pattern did not match for ID: ${id}`)
    const match = (await grabAwemeId(id)).pathname.match(awemeLinkPattern)
    if (!match) return errorPage(c, 'Invalid video ID', 400)
    id = match[3]
  }

  return processVideo(c, id)
}

async function processVideo(c: any, id: string): Promise<Response> {
  if (!id) return new Response('Missing video ID', { status: 400 })
  const { addDesc, hq } = c.req.query()

  try {
    const videoInfo = await scrapeVideoData(id)
    if (videoInfo instanceof NotFoundError) {
      return errorPage(c, 'Video unavailable', 404, 'It may have been deleted, made private, or restricted by TikTok.')
    }
    if (videoInfo instanceof Error) return errorPage(c, videoInfo.message)

    const url = new URL(c.req.url)
    const isHq = (hq || 'false').toLowerCase() == 'true' || url.hostname.includes('hq.')
    const extensions = ['mp4', 'png', 'jpg', 'jpeg', 'webp', 'webm']

    if (url.hostname.includes('d.') || c.req.query('isDirect') === 'true' || extensions.some((suffix) => c.req.path.endsWith(suffix))) {
      const baseUrl = c.get('baseUrl')
      if (videoInfo.video.duration > 0) return c.redirect(baseUrl + '/generate/video/' + videoInfo.id + (isHq ? '?hq=true' : ''))
      return c.redirect(baseUrl + '/generate/image/' + videoInfo.id)
    }

    if (videoInfo.isContentClassified === true) {
      return returnHTMLResponse(await WarningResponse('Sensitive Content', 'the video being age-restricted', c), 200)
    }

    const showDesc = (addDesc || 'false').toLowerCase() == 'true' || url.hostname.includes('a.')
    return returnHTMLResponse(await VideoResponse(videoInfo, showDesc, isHq, c))
  } catch (e) {
    return errorPage(c, (e as Error).message)
  }
}

async function handleLive(c: any): Promise<Response> {
  if (!isBot(c)) return redirectToTikTok(c)
  return processLive(c, c.req.param('author').replace(/^@/, ''))
}

async function processLive(c: any, authorName: string): Promise<Response> {
  try {
    const liveData = await scrapeLiveData(authorName)
    if (liveData instanceof Error) return errorPage(c, liveData.message)

    return returnHTMLResponse(await LiveResponse(liveData, c))
  } catch (e) {
    return errorPage(c, (e as Error).message)
  }
}

app.get('/metrics', serveMetrics)

for (const path of ['/api/v1/statuses/:videoId', '/users/:username/statuses/:videoId']) {
  app.get(path, withRoutePattern(path, respondAlternative))
}

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
