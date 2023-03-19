import { createRedditService } from '$lib/RedditService'
import { error } from '@sveltejs/kit'
import type { PageLoadEvent } from './$types'

export async function load({ params, fetch }: PageLoadEvent) {
	const { username } = params

	const reddit = createRedditService(fetch)

	const resp = await reddit.getListing({ username })

	if (resp.error) {
		throw error(404, resp.error)
	}

	return {
		posts: resp.posts,
		username,
	}
}
