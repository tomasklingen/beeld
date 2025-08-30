import { error } from '@sveltejs/kit'
import type { PageLoadEvent } from './$types'

export async function load({ params, fetch }: PageLoadEvent) {
	const { username } = params

	try {
		const response = await fetch(`/api/reddit?username=${encodeURIComponent(username)}`)

		if (!response.ok) {
			error(response.status, `Failed to load user: ${response.statusText}`)
		}

		const data = await response.json()

		if (data.error) {
			error(404, data.error)
		}

		return {
			posts: data.posts,
			username,
			after: data.after,
			hasMore: data.hasMore,
		}
	} catch (err) {
		console.error('Error loading user:', err)
		error(500, 'Failed to load user data')
	}
}
