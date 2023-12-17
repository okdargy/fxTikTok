import { Hono, Handler } from 'hono'
import { HandlerResponse } from 'hono/types'

import { grabAwemeId, getVideoInfo } from './services/tiktok'
import { VideoResponse } from './templates'

const app = new Hono()
const videoRoutes = [
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

videoRoutes.forEach(route => {
    app.get(route.path, route.handler)
})

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
        return new Response(responseContent, { status: 200 })
    } catch(e) {
        return new Response((e as Error).message, { status: 500 })
    }
}

export default app
