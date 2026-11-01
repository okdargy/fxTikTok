import MetaHelper from '../../util/metaHelper'
import { UserInfo } from '../../types/Web'
import { Context } from 'hono'
import { formatNumber } from '@/util/format'

export function ProfileResponse(data: UserInfo, c: Context): JSX.Element {
  return (
    <>
      {MetaHelper(
        c,
        [
          {
            name: 'og:site_name',
            content: 'fxTikTok'
          },
          {
            name: 'og:title',
            content: `👥 ${formatNumber(data.stats.followerCount)} ❤️ ${formatNumber(data.stats.heartCount)} 🎥 ${formatNumber(data.stats.videoCount)}`
          },
          {
            name: 'theme-color',
            content: '#ff0050'
          },
          {
            name: 'twitter:site',
            content: `@${data.user.uniqueId}`
          },
          {
            name: 'twitter:creator',
            content: `@${data.user.uniqueId}`
          },
          {
            name: 'twitter:title',
            content: `${data.user.nickname} (@${data.user.uniqueId})`
          },
          {
            name: 'og:url',
            content: `https://www.tiktok.com/@${data.user.uniqueId}`
          },
          {
            name: 'og:image',
            content: c.get('baseUrl') + '/generate/pfp/' + data.user.id
          },
          {
            name: 'og:image:type',
            content: 'image/jpeg'
          },
          {
            name: 'og:image:width',
            content: 'auto'
          },
          {
            name: 'og:image:height',
            content: 'auto'
          },
          {
            name: 'og:type',
            content: 'image.other'
          },
          {
            name: 'twitter:card',
            content: 'summary'
          },
          {
            name: 'og:description',
            content: data.user.signature || ''
          }
        ],
        {
          unique_id: data.user.uniqueId,
          nickname: data.user.nickname
        }
      )}
    </>
  )
}
