import type { LegacyRedditPost, RedditPost } from './types/reddit'

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

// Parser function to convert raw Reddit API data to our ADT
function parseRedditPost(rawPost: LegacyRedditPost): RedditPost {
	const basePost = {
		author: rawPost.author,
		domain: rawPost.domain,
		id: rawPost.id,
		name: rawPost.name,
		permalink: rawPost.permalink,
		subreddit: rawPost.subreddit,
		thumbnail: rawPost.thumbnail,
		title: rawPost.title,
		url: rawPost.url,
	}

	// Determine post type based on properties
	if (rawPost.post_hint === 'rich:video' && rawPost.secure_media_embed?.media_domain_url) {
		return {
			...basePost,
			type: 'embed',
			post_hint: 'rich:video',
			secure_media_embed: rawPost.secure_media_embed,
		}
	}


	if (rawPost.post_hint === 'image' && rawPost.preview?.images) {
		return {
			...basePost,
			type: 'image',
			post_hint: 'image',
			preview: {
				images: rawPost.preview.images,
			},
		}
	}

	if (rawPost.is_gallery) {
		return {
			...basePost,
			type: 'gallery',
			is_gallery: true,
			preview: rawPost.preview,
		}
	}

	// Check if it's a self post (text post)
	if (rawPost.domain === `self.${rawPost.subreddit}` || rawPost.url?.includes(`/r/${rawPost.subreddit}/comments/`)) {
		return {
			...basePost,
			type: 'text',
		}
	}

	// Default to link post
	return {
		...basePost,
		type: 'link',
		url: rawPost.url,
	}
}

export function createRedditService(fetchImpl: typeof fetch = fetch) {
	async function getListing(r: RedditRequest): Promise<RedditResponse> {
		const { sorting = 'top', limit = 30, username, subReddit, t = 'week' } = r

		const listType = subReddit
			? (`r/${subReddit}` as const)
			: username
				? (`user/${username}/submitted` as const)
				: null

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
			const c: { data: LegacyRedditPost }[] = respData.data.children
			return {
				error: null,
				posts: c.map((c) => parseRedditPost(c.data)),
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

// Legacy utility functions - updated to work with ADT
export const hasEmbed = (p: RedditPost) => p.type === 'embed'
export const isNormalImage = (p: RedditPost) => p.type === 'image'
export const getImageDimensions = (p: RedditPost) =>
	p.type === 'image' ? p.preview.images[0].source : undefined

export const authorUrl = (p: RedditPost) => {
	return `/u/${p.author}`
}

export const postUrl = (p: RedditPost) => `https://old.reddit.com${p.permalink}`
