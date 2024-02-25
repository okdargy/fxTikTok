import { HandlerResponse } from "hono/types"
import { AwemeList } from "../types/Services"
export const returnHTMLResponse = (content: string, status?: number): HandlerResponse<Response> => {
    return new Response(content, {
        status: status || 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    })
}

export const returnDirectResponse = (videoInfo: AwemeList): HandlerResponse<Response> => {
    if(videoInfo.video.duration !== 0) {
        return new Response('', {
            status: 302,
            headers: {
                'Location': `https://tnktok.com/generate/video/` + videoInfo.aweme_id
            }
        })
    } else {
        return new Response('', {
            status: 302,
            headers: {
                'Location': videoInfo.video.cover.url_list[0]
            }
        })
    }
}