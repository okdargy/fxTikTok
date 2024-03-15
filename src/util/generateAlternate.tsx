import { Context } from "hono"

function formatNumber(value: string): string {
    if(value === '0') return '0'

    // parse num to int
    const num = parseInt(value)
    if (isNaN(num)) return value

    if (num < 1000) return num.toString()
    if (num < 10000) return (num / 1000).toFixed(1) + 'k'
    if (num < 1000000) return (num / 1000).toFixed(1) + 'k'
    if (num < 10000000) return (num / 1000000).toFixed(1) + 'M'
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
    if (num < 10000000000) return (num / 1000000000).toFixed(1) + 'B'
    return (num / 1000000000).toFixed(0) + 'B'
}


export default function generateAlternate(c: Context): {
    version: string,
    type: string,
    author_name: string,
    author_url: string,
    provider_name: string
    provider_url: string
    title: string
} {
    const { likes, comments, shares, unique_id, images } = c.req.query()

    let author_name = '';
    if (likes) author_name += `❤️ ${formatNumber(likes)} `;
    if (comments) author_name += `💬 ${formatNumber(comments)} `;
    if (shares) author_name += `📤 ${formatNumber(shares)} `;
    if (images) author_name += `🖼️ ${images}`;

    return {
        "version": "1.0",
        "type": "link",
        "author_name": author_name,
        "author_url": `https://www.tiktok.com/${unique_id ? '@' + unique_id : ''}`,
        "provider_name": 'fxTikTok',
        "provider_url": "https://github.com/okdargy/fxTikTok",
        "title": `TikTok by @${unique_id}`
    }
}
