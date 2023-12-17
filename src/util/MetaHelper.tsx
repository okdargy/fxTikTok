export default function MetaHelper(tags: {
    name: string,
    content: string
}[]) {
    return (
        <>
            {tags.map((tag) => (
                <meta property={tag.name} content={tag.content} />
            ))}
        </>
    )
}
