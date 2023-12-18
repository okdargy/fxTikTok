import { Context } from "hono"

function formatNumber(value: string): string {
    if(value === '0') return '0'

    // parse num to int
    const num = parseInt(value)
    if (isNaN(num)) return value

    if (num < 1000) return num.toString()
    if (num < 10000) return (num / 1000).toFixed(1) + 'k'
    if (num < 1000000) return (num / 1000).toFixed(1) + 'k'
    if (num < 10000000) return (num / 1000000).toFixed(1) + 'm'
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'm'
    if (num < 10000000000) return (num / 1000000000).toFixed(1) + 'b'
    return (num / 1000000000).toFixed(0) + 'b'
}


export default function generateAlternate(c: Context): {
    version: string,
    type: string,
    author_name: string,
    provider_name: string
    provider_url: string
    title: string
} {
    const { likes, comments, shares, unique_id } = c.req.query()

    return {
        "version": "1.0",
        "type": "link",
        "author_name": `❤️ ${formatNumber(likes)} 💬 ${formatNumber(comments)} 📤 ${formatNumber(shares)}`,
        "provider_name": 'fxTikTok',
        "provider_url": "https://tnktok.com",
        "title": `TikTok by @${unique_id}`
    }
}