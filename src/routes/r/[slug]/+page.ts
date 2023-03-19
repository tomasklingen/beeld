import type { PageLoadEvent } from "./$types";

export async function load({ params, fetch }: PageLoadEvent) {
    const { slug } = params


    const url = `https://www.reddit.com/r/${slug}/hot.json`
    return {
            sub: `/r/${slug}` as const,
            posts: (await fetch(url).then(r => r.json())).data.children.map(c => c.data)
    }
}