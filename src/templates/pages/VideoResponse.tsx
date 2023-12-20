import { AwemeList } from '../../types/Services';
import MetaHelper from '../../util/MetaHelper';

export function VideoResponse(data: AwemeList) {
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
                    content: 'player'
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
                    content: data.desc
                },
                {
                    name: `og:${data.video.duration !== 0 ? 'video' : 'image'}`,
                    content: `https://tnktok.com/generate/${data.video.duration !== 0 ? 'video' : 'image'}/` + data.aweme_id
                },
                {
                    name: 'og:type',
                    content: `video.${data.video.duration !== 0 ? 'video.other' : 'image.other'}`
                },
                {
                    name: `og:${data.video.duration !== 0 ? 'video' : 'image'}:type`,
                    content: `${data.video.duration !== 0 ? 'video/mp4' : 'image/jpeg'}`
                }
            ], {
                likes: data.statistics.digg_count,
                comments: data.statistics.comment_count,
                shares: data.statistics.share_count,
                unique_id: data.author.unique_id
            })
            }
        </>
    )
}