import type { PageLoadEvent } from "./$types";

export async function load({ params, fetch }: PageLoadEvent) {
    const { username } = params

    const url = `https://old.reddit.com/user/${username}/submitted/hot.json`
    return {
            sub: `/user/${username}` as const,
            posts: (await fetch(url).then(r => r.json())).data.children.map(c => c.data)
    }
}