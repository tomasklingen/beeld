import type { RedditPost } from './types/reddit'

type ListSorting = 'hot' | 'top' | 'new' | 'rising' | 'best'
interface RedditRequest {
	sorting?: ListSorting
	limit?: number
	username?: string
	subReddit?: string
}

type RedditResponse =
	| {
			posts: RedditPost[]
			error: null
	  }
	| {
			error: Error
	  }

export function createRedditService(fetchImpl: typeof fetch = fetch) {
	async function getListing(r: RedditRequest): Promise<RedditResponse> {
		const { sorting = 'top', limit = 30, username, subReddit } = r

		const listType = subReddit ? `r/${subReddit}` : username ? `user/${username}/submitted` : null

		if (!listType) {
			throw Error(`need a username or subreddit`)
		}

		return makeRequest(`https://www.reddit.com/${listType}/${sorting}.json?limit=${limit}`)
	}

	async function makeRequest(url: string): Promise<RedditResponse> {
		try {
			console.log(`Fetching: ${url}`)
			const r = await fetchImpl(url)
			if (!r.ok) {
				return {
					error: await r.json(),
				}
			}
			const respData = await r.json()
			const c: { data: any }[] = respData.data.children
			return {
				error: null,
				posts: c.map((c) => c.data) as RedditPost[],
			}
		} catch (e) {
			return {
				error: new Error('Failed to fetch listing', { cause: e as Error }),
			}
		}
	}

	return {
		getListing,
	}
}
