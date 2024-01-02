export default function MetaHelper(tags: {
    name: string,
    content: string,
}[], alternate?: {
    likes: number,
    comments: number,
    shares: number
    unique_id: string
}): JSX.Element {
    return (
        <html lang="en">
            <head>
                {tags.map((tag) => (
                    <meta property={tag.name} content={tag.content} />
                ))}
                {
                    alternate ? (
                        <link rel="alternate" href={`https://fxtiktok-rewrite.dargy.workers.dev/generate/alternate?likes=${alternate.likes}&comments=${alternate.comments}&shares=${alternate.shares}&unique_id=${encodeURIComponent(alternate.unique_id)}`} type="application/json+oembed" />
                    ) : null
                }
            </head>
        </html>
    )
}
