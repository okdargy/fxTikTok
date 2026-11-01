import { Context } from 'hono'
import { buildActivityId, normalizePage } from './activityId'

export default function MetaHelper(
  c: Context,
  tags: {
    name: string
    content: string | null
  }[],
  alternate?: {
    [key: string]: string | number
  },
  awemeId?: string,
  hq?: boolean,
  addDesc?: boolean,
  activityPage?: number
): JSX.Element {
  const baseUrl = c.get('baseUrl')
  const page = normalizePage(activityPage || c.req.query('page'))
  const activityId = awemeId ? buildActivityId(awemeId, { hq, addDesc, page }) : null
  const activityUrl = activityId ? new URL(baseUrl + '/users/' + 'username' + '/statuses/' + activityId) : null

  let alternateUrl = new URL(baseUrl + '/generate/alternate')

  if (alternate) {
    for (const key in alternate) {
      alternateUrl.searchParams.set(key, encodeURIComponent(alternate[key].toString()))
    }
  }

  return (
    <html lang='en'>
      <head>
        {tags.map((tag) => (tag.content ? <meta property={tag.name} content={tag.content} /> : null))}
        {alternate ? <link rel='alternate' href={alternateUrl.toString()} type='application/json+oembed' /> : null}
        {awemeId ? <link rel='alternate' type='application/activity+json' href={activityUrl?.toString()} /> : null}
      </head>
    </html>
  )
}
