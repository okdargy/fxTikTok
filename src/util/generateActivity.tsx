import { scrapeVideoData } from '@/services/tiktok'
import { Context } from 'hono'
import { formatNumber } from './format'
import { env } from 'hono/adapter'
import { buildActivityId, parseActivityId } from './activityId'

export const IMAGES_PER_PAGE = 4

export default async function generateActivity(param: string, c: Context) {
  const { OFF_LOAD } = env(c) as { OFF_LOAD: string }
  const offloadUrl = OFF_LOAD || 'https://offload.tnktok.com'

  const activity = parseActivityId(param, c.req.query('page'))
  const videoId = activity.videoId
  const hq = activity.hq
  const forceDescription = activity.addDesc
  const page = activity.page

  const videoInfo = await scrapeVideoData(videoId)
  if (videoInfo instanceof Error)
    return {
      error: videoInfo.message
    }

  let media = []
  const totalImages = videoInfo.imagePost?.images?.length || 0
  const duration = videoInfo.video.duration
  const hasDuration = totalImages === 0 && Number.isFinite(duration) && duration > 0 && duration <= Number.MAX_SAFE_INTEGER
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE)
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1
  const activityId = buildActivityId(videoId, { hq, addDesc: forceDescription, page: currentPage })
  const base = 'https://tiktok.com/@' + videoInfo.author.uniqueId + '/video/' + videoId
  const statusUrl = totalImages > 0 && totalPages > 1 ? base + '?page=' + currentPage : base

  const title = videoInfo.imagePost && videoInfo.imagePost.title ? `<b>${videoInfo.imagePost.title}</b><br>` : ''

  let descText =
    videoInfo.contents && videoInfo.contents.length > 0
      ? videoInfo.contents
          .map((content) => {
            let text = content.desc

            const extras = [...(content.textExtra || [])].sort((a, b) => b.start - a.start)

            extras.forEach((extra) => {
              const originalText = text.substring(extra.start, extra.end)

              if (extra.type === 0 && extra.userUniqueId) {
                text =
                  text.substring(0, extra.start) +
                  `<a href="https://tiktok.com/@${extra.userUniqueId}">${originalText}</a>` +
                  text.substring(extra.end)
              } else if (extra.type === 1 && extra.hashtagName) {
                text =
                  text.substring(0, extra.start) +
                  `<a href="https://www.tiktok.com/tag/${extra.hashtagName}">${originalText}</a>` +
                  text.substring(extra.end)
              }
            })

            return text
          })
          .join('<br>')
      : videoInfo.desc
          .replace(/@([\w']+)/g, '<a href="https://tiktok.com/@$1">@$1</a>')
          .replace(/#(\w+)/g, '<a href="https://www.tiktok.com/tag/$1">#$1</a>')

  let desc = title + descText + '<br><br>'

  if (videoInfo.video.playAddr) {
    media.push({
      id: videoId + '-video',
      type: 'video',
      url: offloadUrl + '/generate/video/' + videoId + (hq ? '?hq=true' : ''),
      preview_url: offloadUrl + '/generate/cover/' + videoId,
      remote_url: null,
      preview_remote_url: null,
      text_url: null,
      description: null,
      meta: {
        original: {
          width: videoInfo.video.width,
          height: videoInfo.video.height,
          // Playback duration in seconds, from the existing video metadata.
          ...(hasDuration ? { duration } : {})
        }
      }
    })

    if (!forceDescription) desc = '' // Clear description if video and not forced to add it, for aesthetic purposes
  }

  if (videoInfo.imagePost && totalImages > 0) {
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE
    const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, totalImages)

    for (let i = startIndex; i < endIndex; i++) {
      media.push({
        id: videoId + '-image-' + i,
        type: 'image',
        url: offloadUrl + '/generate/image/' + videoId + '/' + (i + 1),
        preview_url: offloadUrl + '/generate/image/' + videoId + '/' + (i + 1) + '?preview=true',
        remote_url: null,
        preview_remote_url: null,
        text_url: null,
        ...(totalImages > IMAGES_PER_PAGE
          ? {
              description: 'Image (' + (i + 1) + ' of ' + videoInfo.imagePost.images.length + ')'
            }
          : {}),
        meta: {
          original: {
            width: videoInfo.imagePost.images[i].imageWidth,
            height: videoInfo.imagePost.images[i].imageHeight
          }
        }
      })
    }
  }

  return {
    id: activityId,
    url: statusUrl,
    uri: statusUrl,
    created_at: new Date(parseInt(videoInfo.createTime) * 1000).toISOString(),
    content:
      desc +
      '<b>❤️ ' +
      formatNumber(videoInfo.stats.diggCount) +
      ' 💬 ' +
      formatNumber(videoInfo.stats.commentCount) +
      ' 🔁 ' +
      formatNumber(videoInfo.stats.shareCount) +
      '</b>',
    // (videoInfo.music && videoInfo.music.original == false && forceDescription ? '<br>🎵 ' + videoInfo.music.authorName + ' - ' + videoInfo.music.title : ''),
    spoiler_text: '',
    language: null,
    visibility: 'public',
    application: {
      name: 'fxTikTok',
      website: 'https://github.com/okdargy/fxTikTok'
    },
    media_attachments: [...media],
    account: {
      id: videoInfo.author.uniqueId,
      display_name: videoInfo.author.nickname + (videoInfo.author.verified ? ' ☑️' : ''),
      username: videoInfo.author.uniqueId,
      acct: videoInfo.author.uniqueId,
      url: 'https://tiktok.com/@' + videoInfo.author.uniqueId,
      created_at: new Date(videoInfo.author.createTime * 1000).toISOString(),
      locked: false,
      bot: false,
      discoverable: true,
      indexable: false,
      group: false,
      avatar: offloadUrl + '/generate/pfp/' + videoInfo.author.id,
      avatar_static: offloadUrl + '/generate/pfp/' + videoInfo.author.id,
      followers_count: videoInfo.stats.followerCount,
      following_count: videoInfo.stats.followingCount,
      header: null,
      header_static: null,
      statuses_count: 0,
      hide_collections: false,
      noindex: false,
      emojis: [],
      roles: [],
      fields: []
    },
    mentions: [],
    tags: [],
    emojis: [],
    card: null,
    poll: null
  }
}
