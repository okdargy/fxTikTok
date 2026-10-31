import { DetailUser, PlayAddr, WebappUserDetail, WebappVideoDetail } from '../types/Web'

const pick = <T extends object, K extends keyof T>(obj: T | undefined, ...keys: K[]) =>
  obj && (Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<T, K>)

const trimPlayAddr = (addr?: PlayAddr) =>
  addr && { DataSize: addr.DataSize, UrlList: addr.UrlList?.filter((url) => url.includes('/aweme/v1/play/')) }

export const trimPfp = (user: Pick<DetailUser, 'avatarMedium' | 'avatarLarger' | 'avatarThumb'>) => ({
  avatarMedium: user.avatarMedium || user.avatarLarger || user.avatarThumb
})

export function trimVideoDetail({ statusCode, statusMsg, itemInfo }: WebappVideoDetail) {
  const item = itemInfo?.itemStruct
  const video = item?.video

  return {
    statusCode,
    statusMsg,
    itemInfo: item && {
      itemStruct: {
        ...pick(item, 'id', 'desc', 'createTime', 'isContentClassified', 'stats'),
        contents: item.contents?.map((content) => ({
          desc: content.desc,
          textExtra: content.textExtra?.map((extra) => pick(extra, 'start', 'end', 'type', 'userUniqueId', 'hashtagName'))
        })),
        author: pick(item.author, 'id', 'uniqueId', 'nickname', 'verified', 'createTime'),
        imagePost: item.imagePost && {
          title: item.imagePost.title,
          images: item.imagePost.images?.map((image) => ({
            ...pick(image, 'imageWidth', 'imageHeight'),
            imageURL: { urlList: image.imageURL?.urlList?.slice(0, 1) } // /generate/image only redirects to the first URL
          }))
        },
        video: video && {
          ...pick(video, 'duration', 'width', 'height', 'cover', 'originCover', 'playAddr'),
          PlayAddrStruct: trimPlayAddr(video.PlayAddrStruct),
          bitrateInfo: video.bitrateInfo?.map((bitrate) => ({ CodecType: bitrate.CodecType, PlayAddr: trimPlayAddr(bitrate.PlayAddr) }))
        }
      }
    }
  }
}

export function trimUserDetail({ statusCode, statusMsg, userInfo }: WebappUserDetail) {
  return {
    statusCode,
    statusMsg,
    userInfo: userInfo && {
      user: userInfo.user && { ...pick(userInfo.user, 'id', 'uniqueId', 'nickname', 'signature'), ...trimPfp(userInfo.user) },
      stats: pick(userInfo.stats, 'followerCount', 'heartCount', 'videoCount')
    }
  }
}
