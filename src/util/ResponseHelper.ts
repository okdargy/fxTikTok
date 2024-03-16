import { HandlerResponse } from "hono/types"
import { AwemeList } from "../types/Services"
export const returnHTMLResponse = (content: string, status?: number): Response => {
    return new Response(content, {
        status: status || 200,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    })
}