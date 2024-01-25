import { TikTokAPIResponse, AwemeList } from "../types/Services"

export async function grabAwemeId(videoId: string): Promise<String | Error> {
    // https://vm.tiktok.com/ZMJmVWVpL/
    const res = await fetch('https://vm.tiktok.com/' + videoId)
    console.log('https://vm.tiktok.com/' + videoId, 'turned to', res.url)
    const url = new URL(res.url)

    const awemeIdPattern = /\/@[\w\d_.]+\/(video|photo)\/(\d{19})/
    const match = url.pathname.match(awemeIdPattern)
    console.log(url.pathname, match)

    if (match) {
        return match[2]
    } else {
        throw new Error('Could not find awemeId')
    }
}

export async function getVideoInfo(awemeId: String): Promise<AwemeList | Error> {
    // https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/7311925846594342175
    const res: Response = await fetch('https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=' + awemeId)
    const json: TikTokAPIResponse = await res.json()
    const videoInfo: AwemeList | undefined = json.aweme_list.find((aweme) => aweme.aweme_id === awemeId)
    
    if(videoInfo) {
        return videoInfo
    } else {
        return new Error('Could not find video info')
    }
}