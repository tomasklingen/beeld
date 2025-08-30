import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createRedditService } from '$lib/RedditService'

export const GET: RequestHandler = async ({ url, fetch }) => {
	const subReddit = url.searchParams.get('subReddit')
	const username = url.searchParams.get('username')
	const sorting =
		(url.searchParams.get('sorting') as 'hot' | 'top' | 'new' | 'rising' | 'best') || 'top'
	const limit = parseInt(url.searchParams.get('limit') || '30')
	const t =
		(url.searchParams.get('t') as 'hour' | 'day' | 'week' | 'month' | 'year' | 'all') || 'week'
	const after = url.searchParams.get('after')

	if (!subReddit && !username) {
		error(400, 'Either subReddit or username parameter is required')
	}

	try {
		const reddit = createRedditService(fetch)
		const resp = await reddit.getListing({
			subReddit: subReddit || undefined,
			username: username || undefined,
			sorting,
			limit,
			t,
			after: after || undefined,
		})

		if (resp.error) {
			error(404, resp.error.message)
		}

		return json(
			{
				posts: resp.posts,
				after: resp.after,
				hasMore: resp.hasMore,
				error: null,
			},
			{
				headers: {
					'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
				},
			}
		)
	} catch (err) {
		console.error('Error fetching Reddit data:', err)
		error(500, 'Failed to fetch Reddit data')
	}
}
