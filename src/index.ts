import { Hono, Handler } from 'hono'
import { HandlerResponse } from 'hono/types'

import { grabAwemeId, getVideoInfo } from './services/tiktok'
import { VideoResponse } from './templates'
import generateAlternate from './util/generateAlternate'

const app = new Hono()
const routes = [
    {
        path: '/:videoId',
        handler: handleVideo
    },
    {
        path: '/:username/video/:videoId',
        handler: handleVideo
    },
    {
        path: '/t/:videoId',
        handler: handleVideo
    }
]

routes.forEach(route => app.get(route.path, route.handler))

const returnHTMLResponse = (content: string): HandlerResponse<Response> => {
    return new Response(content, {
        status: 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
}

async function handleVideo(c: any): Promise<Response> {
    const awemeIdPattern = /^\d{1,19}$/;
    const { videoId } = c.req.param()
    let id = videoId;

    // If the videoId needs to be validated, do it here
    if (!awemeIdPattern.test(videoId)) {
        try {
            const awemeId = await grabAwemeId(videoId)
            id = awemeId
        } catch(e) {
            return new Response((e as Error).message, { status: 500 })
        }
    }

    try {
        const videoInfo = await getVideoInfo(id)

        if (videoInfo instanceof Error) {
            return new Response((videoInfo as Error).message, { status: 500 })
        }

        const responseContent = await VideoResponse(videoInfo);
        return returnHTMLResponse(responseContent) as Response;
    } catch(e) {
        return new Response((e as Error).message, { status: 500 })
    }
}

app.get('/tools/generateAlternate', (c) => {
    const content = JSON.stringify(generateAlternate(c));
    return new Response(content, {
        status: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    })
})

export default app
