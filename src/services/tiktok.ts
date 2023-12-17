import { TikTokAPIResponse, AwemeList } from "../types/Services"

export async function grabAwemeId(videoId: string): Promise<String | Error> {
    // https://vm.tiktok.com/ZMJmVWVpL/
    const res = await fetch('https://vm.tiktok.com/' + videoId)
    
    // find where res redirected us to tiktok.com 302 or tiktok.com/@username/video/awemeId with regex
    const awemeIdPattern = /\/@[\w\d_]+\/video\/(\d{1,19})/
    const match = res.url.match(awemeIdPattern)
    
    if (match) {
        return match[1]
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