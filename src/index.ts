import { Hono } from 'hono'
import { cache } from 'hono/cache'

import { grabAwemeId, getVideoInfo } from './services/tiktok'
import { VideoResponse, ErrorResponse } from './templates'
import generateAlternate from './util/generateAlternate'
import { returnHTMLResponse } from './util/ResponseHelper'

const app = new Hono()

app.get('/test/:videoId', async (c) => {
    const { videoId } = c.req.param()
    const awemeId = await getVideoInfo(videoId)
    
    if(awemeId instanceof Error) {
        return new Response((awemeId as Error).message, { status: 500 })
    }

    return new Response(JSON.stringify(awemeId), {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
})

app.get('/', (c) => {
    return new Response('', {
        status: 302,
        headers: {
            'Location': 'https://github.com/okdargy/fxtiktok'
        }
    })
})

async function handleVideo(c: any): Promise<Response> {
    const awemeIdPattern = /^\d{1,19}$/;
    const BOT_REGEX = /bot|facebook|embed|got|firefox\/92|curl|wget|go-http|yahoo|generator|whatsapp|discord|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|cfnetwork|node/gi

    const { videoId } = c.req.param()
    let id = videoId;

    // If the user agent is a bot, redirect to the TikTok page
    if (!BOT_REGEX.test(c.req.header('User-Agent') || '')) {
        return new Response('', {
            status: 302,
            headers: {
                'Location': 'https://www.tiktok.com' + `${awemeIdPattern.test(videoId) ? c.req.path : '/t/' + videoId}`
            }
        })
    }

    // If the videoId doesn't match the awemeIdPattern, that means we have shortened TikTok link and we need to grab the awemeId
    if (!awemeIdPattern.test(videoId)) {
        try {
            const awemeId = await grabAwemeId(videoId)
            id = awemeId
        } catch(e) {
            const responseContent = await ErrorResponse((e as Error).message);
            return returnHTMLResponse(responseContent, 201);
        }
    }

    try {
        const videoInfo = await getVideoInfo(id)

        if (videoInfo instanceof Error) {
            const responseContent = await ErrorResponse((videoInfo as Error).message);
            return returnHTMLResponse(responseContent, 201);
        }

        const url = new URL(c.req.url);

        if(url.hostname.includes('d.tnktok.com') || c.req.query('isDirect') === 'true') {
                if(videoInfo.video.duration > 0) {
                    return new Response('', {
                        status: 302,
                        headers: {
                            'Location': 'https://fxtiktok-rewrite.dargy.workers.dev/generate/video/' + videoInfo.aweme_id
                        }
                    })
                } else {
                    return new Response('', {
                        status: 302,
                        headers: {
                            'Location': 'https://fxtiktok-rewrite.dargy.workers.dev/generate/image/' + videoInfo.aweme_id
                        }
                    })
                }
        } else {
            const responseContent = await VideoResponse(videoInfo);
            return returnHTMLResponse(responseContent);
        }
    } catch(e) {
        const responseContent = await ErrorResponse((e as Error).message);
        return returnHTMLResponse(responseContent, 201);
    }
}

app.get('/generate/alternate', (c) => {
    const content = JSON.stringify(generateAlternate(c));
    return new Response(content, {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    })
})

app.get(
    '/generate/*',
    cache({
      cacheName: 'my-app',
      cacheControl: 'max-age=3600',
    })
  )

app.get('/generate/video/:videoId', async (c) => {
    const { videoId } = c.req.param()
    const data = await getVideoInfo(videoId);

    if (data instanceof Error) {
        return new Response((data as Error).message, { status: 500,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        })
    }

    if(data.video.play_addr.url_list.length > 0) {
        return c.redirect(data.video.play_addr.url_list[0])
    } else {
        return new Response('No video found', { status: 404,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        })
    }
})

app.get('/generate/image/:videoId', async (c) => {
    const { videoId } = c.req.param()
    const data = await getVideoInfo(videoId);

    if (data instanceof Error) {
        return new Response((data as Error).message, { status: 500 })
    }

    if(data.video.cover.url_list.length > 0) {
        return c.redirect(data.video.cover.url_list[0])
    } else {
        return new Response(JSON.stringify(data), { status: 200 })
    }
})

const routes = [
    {
        path: '/:videoId',
        handler: handleVideo
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
        path: '/t/:videoId',
        handler: handleVideo
    }
]

// temp-fix: add trailing slash to all routes
routes.forEach(route => {
    app.get(route.path, route.handler)
    app.get(route.path + '/', route.handler)
})

export default app
