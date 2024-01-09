import { Hono } from 'hono'
import { HandlerResponse } from 'hono/types'
import { grabAwemeId, getVideoInfo } from '@/services/tiktok'
import { VideoResponse, ErrorResponse } from '@/templates'

export async function handleVideo(c: any): Promise<Response> {
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

    // If the videoId needs to be validated, do it here
    if (!awemeIdPattern.test(videoId)) {
        try {
            const awemeId = await grabAwemeId(videoId)
            id = awemeId
        } catch(e) {
            const responseContent = await ErrorResponse((e as Error).message);
            return returnHTMLResponse(responseContent, 201) as Response;
        }
    }

    try {
        const videoInfo = await getVideoInfo(id)

        if (videoInfo instanceof Error) {
            const responseContent = await ErrorResponse((videoInfo as Error).message);
            return returnHTMLResponse(responseContent, 201) as Response;
        }

        const responseContent = await VideoResponse(videoInfo);
        return returnHTMLResponse(responseContent) as Response;
    } catch(e) {
        const responseContent = await ErrorResponse((e as Error).message);
        return returnHTMLResponse(responseContent, 201) as Response;
    }
}

const returnHTMLResponse = (content: string, status?: number): HandlerResponse<Response> => {
    return new Response(content, {
        status: status || 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    })
}