import type { RedditPost } from './types/reddit'

type ListPeriod = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
type ListSorting = 'hot' | 'top' | 'new' | 'rising' | 'best'
interface RedditRequest {
	sorting?: ListSorting
	limit?: number
	username?: string
	subReddit?: string
	t?: ListPeriod
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
		const { sorting = 'top', limit = 30, username, subReddit, t = 'week' } = r

		const listType = subReddit ? `r/${subReddit}` : username ? `user/${username}/submitted` : null

		if (!listType) {
			throw Error(`need a username or subreddit`)
		}

		return makeRequest(`https://www.reddit.com/${listType}/${sorting}.json?limit=${limit}&t=${t}`)
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
			const c: { data: RedditPost }[] = respData.data.children
			return {
				error: null,
				posts: c.map((c) => c.data),
			}
		} catch (e) {
			console.error(e)
			return {
				error: new Error('Failed to fetch listing', { cause: e as Error }),
			}
		}
	}

	return {
		getListing,
	}
}

export const hasEmbed = (p: RedditPost) => p.post_hint === 'rich:video'
export const isGifv = (p: RedditPost) => {
	return (p.url as string).endsWith('gifv')
}
export const isNormalImage = (p: RedditPost) => p.post_hint === 'image'
export const getImageDimensions = (p: RedditPost) => p.preview.images?.[0].source

export const mp4Link = (link: string) => {
	const newlink = link.replace('gifv', 'mp4')
	return newlink
}

export const authorUrl = (p: RedditPost) => {
	return `/u/${p.author}`
}

export const postUrl = (p: RedditPost) => `https://old.reddit.com${p.permalink}`
