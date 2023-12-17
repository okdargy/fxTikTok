import { AwemeList } from '../../types/Services';
import MetaHelper from '../../util/MetaHelper';

export function VideoResponse(data: AwemeList) {
    return (
        <>
            {MetaHelper([
                { 
                    name: 'og:site_name',
                    content: data.desc // Description 
                },
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
                    content: `❤ ${data.statistics.digg_count} 💬 ${data.statistics.comment_count} 🔁 ${data.statistics.share_count}`
                },
                {
                    name: 'og:video',
                    content: data.video.play_addr.url_list[0]
                },
                {
                    name: 'og:video:secure_url',
                    content: data.video.play_addr.url_list[0]
                },
                {
                    name: 'og:video:width',
                    content: data.video.width.toString()
                },
                {
                    name: 'og:video:height',
                    content: data.video.height.toString()
                },
                {
                    name: 'twitter:player:width',
                    content: data.video.width.toString()
                },
                {
                    name: 'twitter:player:height',
                    content: data.video.height.toString()
                },
                {
                    name: 'twitter:image',
                    content: data.video.cover.url_list[0]
                },
                {
                    name: 'og:video:type',
                    content: 'video/mp4'
                },
                {
                    name: 'twitter:player:stream:content_type',
                    content: 'video/mp4'
                }
            ])}
        </>
    )
}