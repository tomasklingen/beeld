import { error } from '@sveltejs/kit'
import type { PageLoadEvent } from './$types'

export async function load({ params, fetch }: PageLoadEvent) {
	const { slug } = params

	const response = await fetch(`/api/reddit?subReddit=${encodeURIComponent(slug)}`)

	if (!response.ok) {
		error(response.status, `Failed to load subreddit: ${response.statusText}`)
	}

	const data = await response.json()

	if (data.error) {
		error(404, data.error)
	}

	return {
		sub: slug,
		posts: data.posts,
		after: data.after,
		hasMore: data.hasMore,
	}
}
