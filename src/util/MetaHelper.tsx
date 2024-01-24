export default function MetaHelper(tags: {
    name: string,
    content: string | null,
}[], alternate?: {
    likes: number,
    comments: number,
    shares: number
    unique_id: string,
    images: number
}): JSX.Element {
    return (
        <html lang="en">
            <head>
                {tags.map((tag) => (
                    tag.content ? <meta property={tag.name} content={tag.content} /> : null
                ))}
                {
                    alternate ? (
                        <link rel="alternate" href={`https://fxtiktok-rewrite.dargy.workers.dev/generate/alternate?likes=${alternate.likes}&comments=${alternate.comments}&shares=${alternate.shares}&unique_id=${encodeURIComponent(alternate.unique_id)}${alternate.images > 0 ? '&images=' + alternate.images : ''}`} type="application/json+oembed" />
                    ) : null
                }
            </head>
        </html>
    )
}
