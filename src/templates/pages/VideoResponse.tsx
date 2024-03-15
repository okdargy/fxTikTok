import { AwemeList } from '../../types/Services';
import MetaHelper from '../../util/MetaHelper';

export function VideoResponse(data: AwemeList): JSX.Element {
    let videoUrl = 'https://fxtiktok-rewrite.dargy.workers.dev/generate/video/' + data.aweme_id

    if(data.video.duration > 0) {
        const awemeVideo = data.video.download_addr.url_list.find((url) => url.includes('/aweme/v1/play'))
        
        if (awemeVideo) {
            const url = new URL(awemeVideo)
            
            const videoId = url.searchParams.get('video_id')
            const fileId = url.searchParams.get('file_id')

            videoUrl = `https://${url.hostname}/aweme/v1/play/?video_id=${videoId}&file_id=${fileId}&item_id=${data.aweme_id}`
        }
    }

    return (
        <>
            {
            MetaHelper([
                {
                    name: 'og:title',
                    content: `${data.author.nickname} (@${data.author.unique_id})` // Nickname (@username)
                },
                { 
                    name: 'theme-color',
                    content: '#ff0050' // TikTok's theme color
                },
                {
                    name: 'twitter:card',
                    content: `${data.video.duration !== 0 ? 'player' : 'summary_large_image'}`
                },
                {
                    name: 'twitter:site',
                    content: `@${data.author.unique_id}` // @username
                },
                {
                    name: 'twitter:creator',
                    content: `@${data.author.unique_id}` // @username
                },
                {
                    name: 'twitter:title',
                    content: `${data.author.nickname} (@${data.author.unique_id})` // Nickname (@username)
                },
                {
                    name: 'og:url',
                    content: data.share_url
                },
                {
                    name: 'og:description',
                    content: data.video.duration !== 0 ? data.desc : null
                },
                {
                    name: `og:${data.video.duration !== 0 ? 'video' : 'image'}`,
                    content: `${data.video.duration !== 0 ? videoUrl : 'https://fxtiktok-rewrite.dargy.workers.dev/generate/image/' + data.aweme_id}`
                },
                {
                    name: 'og:type',
                    content: `${data.video.duration !== 0 ? 'video.other' : 'image.other'}`
                },
                {
                    name: `og:${data.video.duration !== 0 ? 'video' : 'image'}:type`,
                    content: `${data.video.duration !== 0 ? 'video/mp4' : 'image/jpeg'}`
                },
                {
                    name: `og:${data.video.duration !== 0 ? 'video' : 'image'}:width`,
                    content: `${data.video.duration !== 0 ? data.video.width : data.video.cover.width}`
                },
                {
                   name: `og:${data.video.duration !== 0 ? 'video' : 'image'}:height`,
                   content: `${data.video.duration !== 0 ? data.video.height : data.video.cover.height}` 
                },
            ], {
                likes: data.statistics.digg_count,
                comments: data.statistics.comment_count,
                shares: data.statistics.share_count,
                unique_id: data.author.unique_id,
                images: data.image_post_info ? data.image_post_info.images.length : 0
            })
            }
        </>
    )
}