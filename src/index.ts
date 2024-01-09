import { Hono, Handler } from 'hono'
import { cache } from 'hono/cache'

import { getVideoInfo } from '@/services/tiktok'
import generateAlternate from '@/util/generateAlternate'
import { handleVideo} from '@/videoRoutes'

const app = new Hono()

app.get('/', (c) => {
    return new Response('', {
        status: 302,
        headers: {
            'Location': 'https://github.com/okdargy/fxtiktok'
        }
    })
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
        path: '/t/:videoId',
        handler: handleVideo
    }
]
    
// temp-fix: add trailing slash to all routes
routes.forEach(route => {
    app.get(route.path, route.handler)
    app.get(route.path + '/', route.handler)
})

// Cache all generate requests for 1 hour
app.get('/generate/*', cache({
    cacheName: 'my-app',
    cacheControl: 'max-age=3600',
}))

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

export default app
