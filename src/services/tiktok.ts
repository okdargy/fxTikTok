import { TikTokAPIResponse, AwemeList } from "../types/Services"

export async function grabAwemeId(videoId: string): Promise<String | Error> {
    // https://vm.tiktok.com/ZMJmVWVpL/
    const res = await fetch('https://vm.tiktok.com/' + videoId)
    const url = new URL(res.url)

    const awemeIdPattern = /\/@[\w\d_.]+\/(video|photo)\/(\d{19})/
    const match = url.pathname.match(awemeIdPattern)

    if (match) {
        return match[2]
    } else {
        throw new Error('Could not find awemeId')
    }
}

export async function getVideoInfo(awemeId: String): Promise<AwemeList | Error> {
    const res: Response = await fetch('https://api19-normal-c-useast2a.tiktokv.com/aweme/v1/feed/?aweme_id=' + awemeId, {
        cf: {
            cacheEverything: true,
            cacheTtlByStatus: { "200-299": 86400, 404: 1, "500-599": 0 },
        },
    })
    const json: TikTokAPIResponse = await res.json()
    const videoInfo: AwemeList | undefined = json.aweme_list.find((aweme) => aweme.aweme_id === awemeId)

    if (videoInfo) {
        return videoInfo
    } else {
        return new Error('Could not find video info')
    }
}