import { createRedditService } from "$lib/RedditService";
import { error } from "@sveltejs/kit";
import type { PageLoadEvent } from "./$types";

export async function load({ params, fetch }: PageLoadEvent) {
    const { slug } = params

	const reddit = createRedditService(fetch);
    const resp = await reddit.getListing({ subReddit: slug })

    if(resp.error) {
        throw error(404, resp.error)
    }

    return {
        sub: slug,
        posts: resp.posts
    }
}