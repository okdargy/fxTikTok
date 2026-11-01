import MetaHelper from '../../util/metaHelper'
import { ItemStruct } from '../../types/Web'
import { Context } from 'hono'
import { IMAGES_PER_PAGE } from '../../util/generateActivity'

export function VideoResponse(data: ItemStruct, addDesc: boolean, hq: boolean, c: Context): JSX.Element {
  const baseUrl = c.get('baseUrl')
  const pageParam = parseInt(c.req.query('page') || '1')
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  let activityPage = 1

  const videoUrl = baseUrl + '/generate/video/' + data.id + '.mp4' + (hq ? '?hq=true' : '')
  let videoMeta: { name: string; content: string }[] = []

  if (data.video.duration !== 0) {
    videoMeta = [
      {
        name: 'og:video',
        content: videoUrl
      },
      // {
      //   name: 'og:video:secure_url',
      //   content: videoUrl
      // },
      {
        name: 'og:video:type',
        content: 'video/mp4'
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
        name: 'og:type',
        content: 'video.other'
      },
      {
        name: 'og:video:type',
        content: 'video/mp4'
      },

      // {
      //   name: 'twitter:card',
      //   content: 'player'
      // },
      {
        name: 'twitter:player:height',
        content: data.video.height.toString()
      },
      {
        name: 'twitter:player:width',
        content: data.video.width.toString()
      },
      {
        name: 'twitter:player',
        content: videoUrl
      },
      {
        name: 'twitter:player:stream',
        content: videoUrl
      },
      {
        name: 'twitter:player:stream:content_type',
        content: 'video/mp4'
      }
    ]
  } else {
    const totalImages = data.imagePost.images.length
    const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE)
    const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1
    activityPage = currentPage
    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE
    const endIndex = Math.min(startIndex + IMAGES_PER_PAGE, totalImages)

    videoMeta = data.imagePost.images.slice(startIndex, endIndex).flatMap((_, offset) => {
      const imageIndex = startIndex + offset

      return [
        {
          name: 'og:image',
          content: baseUrl + '/generate/image/' + data.id + '?index=' + imageIndex
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
          content: 'summary_large_image'
        }
      ]
    })
  }

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
            content: `${data.author.nickname} (@${data.author.uniqueId})`
          },
          {
            name: 'theme-color',
            content: '#ff0050'
          },
          {
            name: 'twitter:site',
            content: `@${data.author.uniqueId}`
          },
          {
            name: 'twitter:creator',
            content: `@${data.author.uniqueId}`
          },
          {
            name: 'twitter:title',
            content: `${data.author.nickname} (@${data.author.uniqueId})`
          },
          {
            name: 'og:url',
            content: `https://www.tiktok.com/@${data.author.uniqueId}/video/${data.id}`
          },
          ...(!addDesc
            ? [
                {
                  name: 'og:description',
                  content: data.desc
                }
              ]
            : []),
          ...videoMeta
        ],
        {
          unique_id: data.author.uniqueId,
          nickname: data.author.nickname,
          ...(addDesc ? { description: Buffer.from(data.desc, 'utf-8').toString('base64') } : {})
        },
        data.id,
        hq,
        addDesc,
        activityPage
      )}
    </>
  )
}
